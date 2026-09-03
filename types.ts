// Identifiants de créneaux : doivent correspondre exactement aux lignes
// de la table `time_slots` dans supabase/schema.sql
export type TimeSlotId = "07:30-08:15" | "08:30-09:15" | "09:30-10:15";

export type ReservationStatus = "confirmed" | "checked_in" | "cancelled";

export interface Reservation {
  id: string;
  room_number: string;
  guest_count: number;
  time_slot_id: TimeSlotId;
  tables_needed: number;
  special_request: string | null;
  status: ReservationStatus;
  service_date: string;
  created_at: string;
  checked_in_at: string | null;
}

export interface SlotCapacity {
  time_slot_id: TimeSlotId;
  label: string;
  max_tables: number;
  used_tables: number;
  display_order: number;
}

// Résultat renvoyé par la fonction SQL check_in_reservation()
export interface CheckInResult {
  reservation: Reservation;
  is_on_time: boolean;
  server_time: string;
}
