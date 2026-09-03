import type { TimeSlotId } from "./types";

// Doit rester identique aux lignes insérées dans supabase/schema.sql
export const MAX_TABLES_PER_SLOT = 34;
export const MAX_GUESTS_PER_ROOM = 8;
export const EXTRA_TABLE_THRESHOLD = 3; // au-delà de ce nombre de pax -> 2 tables

export const TIME_SLOTS: {
  id: TimeSlotId;
  label: string;
  shortLabel: string;
  colorVar: string; // nom de la variable CSS de couleur (voir globals.css)
}[] = [
  {
    id: "07:30-08:15",
    label: "07h30 – 08h15",
    shortLabel: "Tôt",
    colorVar: "--color-slot-sunrise",
  },
  {
    id: "08:30-09:15",
    label: "08h30 – 09h15",
    shortLabel: "Milieu de matinée",
    colorVar: "--color-slot-burgundy",
  },
  {
    id: "09:30-10:15",
    label: "09h30 – 10h15",
    shortLabel: "Fin de matinée",
    colorVar: "--color-slot-harbor",
  },
];

/** 1 chambre = 1 table, sauf au-delà de 3 personnes -> 2 tables. */
export function tablesNeededFor(guestCount: number): number {
  return guestCount > EXTRA_TABLE_THRESHOLD ? 2 : 1;
}

/** Date du jour (YYYY-MM-DD) à l'heure de Paris, pour filtrer les listes
 *  côté client de la même façon que le fait service_date côté base. */
export function todayInParis(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

export function slotLabel(id: TimeSlotId): string {
  return TIME_SLOTS.find((s) => s.id === id)?.label ?? id;
}

export function formatServerError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("COMPLET")) {
    return "Ce créneau vient d'atteindre sa capacité maximale. Merci de choisir un autre horaire.";
  }
  if (message.includes("Créneau invalide")) {
    return "Ce créneau n'existe pas. Merci de rafraîchir la page.";
  }
  return "Une erreur est survenue. Merci de réessayer.";
}
