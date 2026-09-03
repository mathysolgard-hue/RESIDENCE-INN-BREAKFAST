import { supabase } from "./supabase";
import { tablesNeededFor, todayInParis } from "./slots";
import type { CheckInResult, Reservation, SlotCapacity, TimeSlotId } from "./types";

/**
 * Capacité utilisée / maximale par créneau.
 * Passe par la fonction SQL get_slot_capacity() (SECURITY DEFINER) : le
 * client anonyme ne peut pas lire la table `reservations` directement
 * (RLS), seulement ce résumé agrégé et anonyme.
 */
export async function getSlotCapacity(): Promise<SlotCapacity[]> {
  const { data, error } = await supabase.rpc("get_slot_capacity");
  if (error) throw error;
  return (data ?? []) as SlotCapacity[];
}

/**
 * Crée une réservation via la fonction SQL create_reservation(), qui
 * vérifie la capacité restante et effectue l'insertion de façon atomique
 * (verrou par créneau côté base) pour éviter tout surbooking en cas de
 * double clic ou de deux clients qui valident en même temps.
 */
export async function createReservation(params: {
  roomNumber: string;
  guestCount: number;
  timeSlotId: TimeSlotId;
  specialRequest: string;
}): Promise<Reservation> {
  const { data, error } = await supabase.rpc("create_reservation", {
    p_room_number: params.roomNumber.trim(),
    p_guest_count: params.guestCount,
    p_time_slot_id: params.timeSlotId,
    p_special_request: params.specialRequest.trim() || null,
  });
  if (error) throw error;
  return data as Reservation;
}

/**
 * Relit une réservation à partir de son id (uuid non devinable). Utilisé
 * par l'écran de confirmation, y compris après un rafraîchissement de page.
 */
export async function getReservationById(id: string): Promise<Reservation | null> {
  const { data, error } = await supabase.rpc("get_reservation_by_id", { p_id: id });
  if (error) throw error;
  return (data as Reservation) ?? null;
}

/**
 * Réservations du jour, réservées au personnel connecté (policy RLS
 * `authenticated`). Filtrées sur service_date pour ne jamais mélanger
 * avec l'historique des jours précédents.
 */
export async function listReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("service_date", todayInParis())
    .order("time_slot_id", { ascending: true })
    .order("room_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reservation[];
}

/**
 * Recherche des réservations du jour pour une chambre donnée — utilisé par
 * la saisie manuelle du scanner quand la caméra ne peut pas lire le QR
 * code. Réservé au personnel connecté (policy RLS côté fonction).
 */
export async function findTodaysReservationsByRoom(
  roomNumber: string
): Promise<Reservation[]> {
  const { data, error } = await supabase.rpc("find_todays_reservations_by_room", {
    p_room_number: roomNumber,
  });
  if (error) throw error;
  return (data ?? []) as Reservation[];
}

/**
 * Pointage à l'entrée du petit-déjeuner. La validation de l'horaire est
 * faite côté serveur (horloge de la base, pas celle du téléphone du
 * client) pour éviter toute triche ou erreur de fuseau/horaire local.
 */
export async function checkInReservation(id: string): Promise<CheckInResult> {
  const { data, error } = await supabase.rpc("check_in_reservation", { p_id: id });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as CheckInResult;
}

export { tablesNeededFor };
