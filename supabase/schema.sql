-- ==========================================================================
-- Residence Inn by Marriott — Lille
-- Réservation des petits-déjeuners — Schéma de base de données (PostgreSQL)
-- À exécuter dans : Supabase > SQL Editor > New query > coller > Run
-- ==========================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Table "capacites" : nombre maximum de tables par créneau.
-- Modifiable directement dans Supabase (Table editor) si besoin d'ajuster,
-- par ex. un jour de forte affluence.
-- --------------------------------------------------------------------------
create table if not exists capacites (
  time_slot   text primary key,           -- ex: '07:30-08:15'
  label       text not null,              -- ex: '07h30 – 08h15'
  max_tables  integer not null default 34
);

insert into capacites (time_slot, label, max_tables) values
  ('07:30-08:15', '07h30 – 08h15', 34),
  ('08:30-09:15', '08h30 – 09h15', 34),
  ('09:30-10:15', '09h30 – 10h15', 34)
on conflict (time_slot) do nothing;

-- --------------------------------------------------------------------------
-- Table "reservations" : une ligne = une réservation client.
-- --------------------------------------------------------------------------
create table if not exists reservations (
  id                uuid primary key default gen_random_uuid(),
  reservation_date  date not null,
  room_number       text not null,
  guest_count       integer not null check (guest_count > 0 and guest_count <= 10),
  time_slot         text not null references capacites (time_slot),
  tables_needed     integer not null check (tables_needed in (1, 2)),
  special_request   text,
  status            text not null default 'confirmed'
                      check (status in ('confirmed', 'checked_in', 'cancelled', 'no_show')),
  created_at        timestamptz not null default now(),
  checked_in_at      timestamptz
);

create index if not exists idx_reservations_date_slot
  on reservations (reservation_date, time_slot);

-- --------------------------------------------------------------------------
-- Sécurité : verrouillage complet des tables.
-- Cette application n'utilise QUE la clé secrète "service_role" côté serveur
-- (dans les Server Actions Next.js). Le navigateur du client ne parle jamais
-- directement à Supabase. On active donc le RLS (Row Level Security) sans
-- créer aucune "policy" : plus personne (anon/authenticated) ne peut lire ou
-- écrire ces tables directement, seule la clé service_role le peut (elle
-- contourne le RLS par nature chez Supabase).
-- --------------------------------------------------------------------------
alter table capacites enable row level security;
alter table reservations enable row level security;

-- --------------------------------------------------------------------------
-- Fonction "create_reservation" : création atomique d'une réservation.
--
-- Pourquoi une fonction SQL et pas un simple "insert" fait depuis le code ?
-- Parce qu'en production (Vercel), plusieurs clients peuvent réserver au
-- même instant sur des serveurs différents. Un simple "vérifier puis
-- insérer" fait en JavaScript pourrait laisser passer 35 réservations sur
-- un créneau limité à 34 (race condition). Ici, on verrouille la ligne de
-- capacité ("for update") le temps de la transaction : les réservations
-- concurrentes sur le même créneau sont traitées une par une, jamais en
-- parallèle, ce qui garantit qu'on ne dépasse jamais la limite.
-- --------------------------------------------------------------------------
create or replace function create_reservation(
  p_room_number      text,
  p_guest_count      integer,
  p_time_slot        text,
  p_reservation_date date,
  p_special_request  text default null
)
returns reservations
language plpgsql
as $$
declare
  v_tables_needed integer;
  v_used          integer;
  v_max           integer;
  v_row           reservations;
begin
  if p_guest_count is null or p_guest_count <= 0 then
    raise exception 'INVALID_GUEST_COUNT';
  end if;

  -- Règle métier : au-delà de 3 personnes, il faut 2 tables.
  v_tables_needed := case when p_guest_count > 3 then 2 else 1 end;

  -- Verrouille la ligne de capacité correspondant au créneau visé.
  select max_tables into v_max
  from capacites
  where time_slot = p_time_slot
  for update;

  if v_max is null then
    raise exception 'INVALID_SLOT';
  end if;

  select coalesce(sum(tables_needed), 0) into v_used
  from reservations
  where reservation_date = p_reservation_date
    and time_slot = p_time_slot
    and status <> 'cancelled';

  if v_used + v_tables_needed > v_max then
    raise exception 'SLOT_FULL';
  end if;

  insert into reservations (
    reservation_date, room_number, guest_count,
    time_slot, tables_needed, special_request
  ) values (
    p_reservation_date, p_room_number, p_guest_count,
    p_time_slot, v_tables_needed, nullif(trim(p_special_request), '')
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- Fin du script. Vous pouvez vérifier que tout est en place avec :
-- select * from capacites;
-- select * from reservations;
