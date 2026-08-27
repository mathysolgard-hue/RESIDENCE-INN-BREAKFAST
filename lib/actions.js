'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from './supabaseAdmin';
import { SLOTS, todayParis, currentSlotValue } from './time';
import { STAFF_COOKIE_NAME, getExpectedSessionValue } from './auth';

// ============================================================
// ESPACE CLIENT
// ============================================================

// Renvoie, pour chaque créneau, le nombre de tables utilisées / restantes.
export async function getAvailability(date) {
  const supabase = getSupabaseAdmin();
  const targetDate = date || todayParis();

  const [{ data: capacites, error: capError }, { data: reservations, error: resError }] =
    await Promise.all([
      supabase.from('capacites').select('time_slot, max_tables, label'),
      supabase
        .from('reservations')
        .select('time_slot, tables_needed, status')
        .eq('reservation_date', targetDate)
        .neq('status', 'cancelled'),
    ]);

  if (capError) throw new Error(capError.message);
  if (resError) throw new Error(resError.message);

  return SLOTS.map((slot) => {
    const cap = capacites?.find((c) => c.time_slot === slot.value);
    const max = cap?.max_tables ?? 34;
    const used = (reservations || [])
      .filter((r) => r.time_slot === slot.value)
      .reduce((sum, r) => sum + r.tables_needed, 0);
    return {
      ...slot,
      max,
      used,
      left: Math.max(max - used, 0),
      isFull: used >= max,
    };
  });
}

// Crée une réservation. Appelée directement par le <form action={...}> du
// formulaire client (voir components/BookingForm.jsx).
export async function createReservation(prevState, formData) {
  const room_number = (formData.get('room_number') || '').toString().trim();
  const guest_count = parseInt(formData.get('guest_count'), 10);
  const time_slot = (formData.get('time_slot') || '').toString();
  const special_request = (formData.get('special_request') || '').toString().trim();

  if (!room_number) {
    return { error: 'Merci d\'indiquer votre numéro de chambre.' };
  }
  if (!guest_count || guest_count < 1) {
    return { error: 'Merci d\'indiquer le nombre de personnes.' };
  }
  if (!SLOTS.some((s) => s.value === time_slot)) {
    return { error: 'Merci de choisir un créneau horaire.' };
  }

  const supabase = getSupabaseAdmin();
  const reservation_date = todayParis();

  const { data, error } = await supabase.rpc('create_reservation', {
    p_room_number: room_number,
    p_guest_count: guest_count,
    p_time_slot: time_slot,
    p_reservation_date: reservation_date,
    p_special_request: special_request || null,
  });

  if (error) {
    if (error.message?.includes('SLOT_FULL')) {
      return { error: 'Ce créneau vient de passer complet. Merci de choisir un autre horaire.' };
    }
    return { error: 'Une erreur est survenue, merci de réessayer.' };
  }

  revalidatePath('/');
  redirect(`/confirmation/${data.id}`);
}

// Récupère une réservation par son identifiant (page de confirmation / ticket).
export async function getReservationById(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

// ============================================================
// ESPACE EMPLOYÉ — Authentification
// ============================================================

export async function loginAction(prevState, formData) {
  const password = (formData.get('password') || '').toString();

  if (!process.env.STAFF_PASSWORD) {
    return { error: 'STAFF_PASSWORD n\'est pas configuré côté serveur (voir .env.local).' };
  }
  if (password !== process.env.STAFF_PASSWORD) {
    return { error: 'Mot de passe incorrect.' };
  }

  const value = await getExpectedSessionValue();
  cookies().set(STAFF_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 heures
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  cookies().delete(STAFF_COOKIE_NAME);
  redirect('/dashboard/login');
}

// ============================================================
// ESPACE EMPLOYÉ — Tableau de bord
// ============================================================

export async function listReservations(date, slot) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('reservations')
    .select('*')
    .eq('reservation_date', date || todayParis())
    .order('time_slot', { ascending: true })
    .order('room_number', { ascending: true });

  if (slot) query = query.eq('time_slot', slot);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReservationStatus(id, status) {
  const supabase = getSupabaseAdmin();
  const patch = { status };
  if (status === 'checked_in') patch.checked_in_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('reservations')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
  return data;
}

// ============================================================
// ESPACE EMPLOYÉ — Scan du QR code à l'entrée
// ============================================================

export async function scanReservation(rawValue) {
  const id = (rawValue || '').toString().trim();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { result: 'NOT_FOUND' };
  }

  if (data.status === 'cancelled') {
    return { result: 'CANCELLED', reservation: data };
  }

  const today = todayParis();
  if (data.reservation_date !== today) {
    return { result: 'WRONG_DAY', reservation: data };
  }

  const current = currentSlotValue();
  const isMatch = current === data.time_slot;

  // Si le créneau correspond et que ce n'est pas déjà scanné, on marque
  // automatiquement le client comme arrivé.
  if (data.status !== 'checked_in' && isMatch) {
    await supabase
      .from('reservations')
      .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
      .eq('id', id);
    return { result: 'OK', reservation: { ...data, status: 'checked_in' } };
  }

  if (data.status === 'checked_in') {
    return { result: 'ALREADY_CHECKED_IN', reservation: data };
  }

  return { result: 'WRONG_SLOT', reservation: data };
}

// Permet au personnel de faire entrer un client malgré un mauvais créneau
// (ex : tolérance accordée par l'équipe).
export async function forceCheckIn(id) {
  return updateReservationStatus(id, 'checked_in');
}
