-- ============================================================================
-- Réservation des petits-déjeuners — Residence Inn by Marriott Lille
-- Schéma Supabase (Postgres). À exécuter en une fois dans :
-- Supabase > SQL Editor > New query > coller ce fichier > Run
-- ============================================================================

create extension if not exists "pgcrypto"; -- pour gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. Table de référence des créneaux
-- ----------------------------------------------------------------------------
create table if not exists public.time_slots (
  id text primary key,              -- ex: '07:30-08:15'
  label text not null,              -- ex: '07h30 – 08h15'
  max_tables int not null default 34,
  display_order int not null
);

insert into public.time_slots (id, label, max_tables, display_order) values
  ('07:30-08:15', '07h30 – 08h15', 34, 1),
  ('08:30-09:15', '08h30 – 09h15', 34, 2),
  ('09:30-10:15', '09h30 – 10h15', 34, 3)
on conflict (id) do nothing;

-- Pour changer la jauge de 34 tables plus tard, il suffit de modifier
-- max_tables ici (aucune autre partie du code n'a besoin d'être touchée) :
--   update public.time_slots set max_tables = 40 where id = '07:30-08:15';

-- ----------------------------------------------------------------------------
-- 2. Table des réservations
--
-- `service_date` est essentiel : c'est ce qui permet à la jauge de 34
-- tables de se réinitialiser chaque matin. Sans cette colonne, les
-- réservations d'hier compteraient encore dans la capacité d'aujourd'hui.
-- Elle est calculée automatiquement à l'heure de Paris, indépendamment du
-- fuseau horaire du serveur ou de l'appareil du client.
-- ----------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  room_number text not null,
  guest_count int not null check (guest_count > 0 and guest_count <= 20),
  time_slot_id text not null references public.time_slots(id),
  tables_needed int not null check (tables_needed in (1, 2)),
  special_request text,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'checked_in', 'cancelled')),
  service_date date not null default ((now() at time zone 'Europe/Paris')::date),
  created_at timestamptz not null default now(),
  checked_in_at timestamptz
);

create index if not exists reservations_slot_date_idx
  on public.reservations (service_date, time_slot_id);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security
--
-- Principe retenu : la table `reservations` n'est jamais lue ni modifiée
-- directement par un visiteur anonyme (le client de l'hôtel qui réserve
-- depuis le QR code de sa chambre). Toutes ses interactions passent par des
-- fonctions SQL "SECURITY DEFINER" ci-dessous, qui exposent exactement ce
-- dont il a besoin (créer une réservation, relire LA SIENNE par id, voir la
-- capacité agrégée) sans jamais lui donner accès à la liste des chambres et
-- des notes des autres clients. Le personnel, une fois connecté
-- (Supabase Auth), a lui un accès complet en lecture/écriture.
-- ----------------------------------------------------------------------------
alter table public.time_slots enable row level security;
alter table public.reservations enable row level security;

create policy "time_slots: lecture publique"
  on public.time_slots for select
  using (true);

create policy "reservations: lecture réservée au personnel connecté"
  on public.reservations for select
  using (auth.role() = 'authenticated');

create policy "reservations: mise à jour réservée au personnel connecté"
  on public.reservations for update
  using (auth.role() = 'authenticated');

-- Volontairement aucune policy INSERT pour `anon` : la création passe
-- uniquement par create_reservation() ci-dessous.

-- ----------------------------------------------------------------------------
-- 4. Capacité agrégée par créneau, POUR AUJOURD'HUI (lecture publique,
--    aucune donnée personnelle exposée). Le filtre sur service_date est
--    dans la condition du LEFT JOIN (pas un WHERE) pour que les créneaux
--    sans aucune réservation aujourd'hui restent visibles avec 0/34.
-- ----------------------------------------------------------------------------
create or replace function public.get_slot_capacity()
returns table (
  time_slot_id text,
  label text,
  max_tables int,
  used_tables int,
  display_order int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ts.id,
    ts.label,
    ts.max_tables,
    coalesce(sum(r.tables_needed) filter (where r.status <> 'cancelled'), 0)::int,
    ts.display_order
  from public.time_slots ts
  left join public.reservations r
    on r.time_slot_id = ts.id
    and r.service_date = (now() at time zone 'Europe/Paris')::date
  group by ts.id, ts.label, ts.max_tables, ts.display_order
  order by ts.display_order;
$$;

grant execute on function public.get_slot_capacity to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Création atomique d'une réservation
--
-- pg_advisory_xact_lock sérialise les créations pour un même créneau : si
-- deux clients valident au même instant, le second attend la fin de la
-- transaction du premier avant que son propre comptage de tables ne soit
-- effectué, ce qui empêche un dépassement de la jauge de 34 tables. Le
-- calcul de v_used_tables est lui aussi limité à service_date = aujourd'hui.
-- ----------------------------------------------------------------------------
create or replace function public.create_reservation(
  p_room_number text,
  p_guest_count int,
  p_time_slot_id text,
  p_special_request text
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tables_needed int;
  v_used_tables int;
  v_max_tables int;
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_reservation public.reservations;
begin
  if p_room_number is null or length(trim(p_room_number)) = 0 then
    raise exception 'Numéro de chambre requis';
  end if;
  if p_guest_count is null or p_guest_count <= 0 then
    raise exception 'Nombre de personnes invalide';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_time_slot_id || v_today::text));

  select max_tables into v_max_tables
  from public.time_slots where id = p_time_slot_id;

  if v_max_tables is null then
    raise exception 'Créneau invalide';
  end if;

  v_tables_needed := case when p_guest_count > 3 then 2 else 1 end;

  select coalesce(sum(tables_needed), 0) into v_used_tables
  from public.reservations
  where time_slot_id = p_time_slot_id
    and service_date = v_today
    and status <> 'cancelled';

  if v_used_tables + v_tables_needed > v_max_tables then
    raise exception 'COMPLET';
  end if;

  insert into public.reservations
    (room_number, guest_count, time_slot_id, tables_needed, special_request, service_date)
  values
    (trim(p_room_number), p_guest_count, p_time_slot_id, v_tables_needed, p_special_request, v_today)
  returning * into v_reservation;

  return v_reservation;
end;
$$;

grant execute on function public.create_reservation to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. Relecture d'une réservation par id (écran de confirmation client)
-- ----------------------------------------------------------------------------
create or replace function public.get_reservation_by_id(p_id uuid)
returns public.reservations
language sql
security definer
set search_path = public
stable
as $$
  select * from public.reservations where id = p_id;
$$;

grant execute on function public.get_reservation_by_id to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7. Recherche du jour par numéro de chambre — réservé au personnel,
--    utilisé par la saisie manuelle du scanner quand la caméra ne peut
--    pas lire le QR code. Restreint à `authenticated` : un client ne doit
--    pas pouvoir interroger la réservation d'une autre chambre.
-- ----------------------------------------------------------------------------
create or replace function public.find_todays_reservations_by_room(p_room_number text)
returns setof public.reservations
language sql
security definer
set search_path = public
stable
as $$
  select * from public.reservations
  where room_number = trim(p_room_number)
    and service_date = (now() at time zone 'Europe/Paris')::date
  order by created_at desc;
$$;

grant execute on function public.find_todays_reservations_by_room to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Pointage à l'entrée (scan QR par le personnel)
--
-- La validation "bon créneau / mauvais créneau" se fait avec l'horloge du
-- serveur (Europe/Paris), jamais avec celle du téléphone utilisé pour
-- scanner. Une marge de 10 minutes avant le début du créneau est tolérée
-- (un client en avance ne doit pas être bloqué inutilement) ; ajustez
-- l'intervalle ci-dessous si besoin.
-- ----------------------------------------------------------------------------
create or replace function public.check_in_reservation(p_id uuid)
returns table (
  reservation public.reservations,
  is_on_time boolean,
  server_time timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations;
  v_slot_start time;
  v_slot_end time;
  v_now_paris time := (now() at time zone 'Europe/Paris')::time;
  v_on_time boolean;
begin
  select * into v_reservation from public.reservations where id = p_id;
  if not found then
    raise exception 'Réservation introuvable';
  end if;

  v_slot_start := split_part(v_reservation.time_slot_id, '-', 1)::time;
  v_slot_end := split_part(v_reservation.time_slot_id, '-', 2)::time;

  v_on_time :=
    v_reservation.status <> 'cancelled'
    and v_now_paris between (v_slot_start - interval '10 minutes') and v_slot_end;

  if v_on_time and v_reservation.status = 'confirmed' then
    update public.reservations
      set status = 'checked_in', checked_in_at = now()
      where id = p_id
      returning * into v_reservation;
  end if;

  return query select v_reservation, v_on_time, now();
end;
$$;

grant execute on function public.check_in_reservation to authenticated;

-- ----------------------------------------------------------------------------
-- 9. Realtime : permet au tableau de bord de se mettre à jour en direct
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.reservations;
