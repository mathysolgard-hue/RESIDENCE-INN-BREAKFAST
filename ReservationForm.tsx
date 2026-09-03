"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import TimeSlotPicker from "./TimeSlotPicker";
import { createReservation, getSlotCapacity } from "@/lib/reservations";
import {
  EXTRA_TABLE_THRESHOLD,
  MAX_GUESTS_PER_ROOM,
  formatServerError,
} from "@/lib/slots";
import type { SlotCapacity, TimeSlotId } from "@/lib/types";

export default function ReservationForm() {
  const router = useRouter();

  const [roomNumber, setRoomNumber] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [timeSlotId, setTimeSlotId] = useState<TimeSlotId | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");

  const [capacities, setCapacities] = useState<SlotCapacity[]>([]);
  const [loadingCapacities, setLoadingCapacities] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshCapacities() {
    try {
      const data = await getSlotCapacity();
      setCapacities(data);
    } catch {
      // Silencieux : la fonction de création revérifie de toute façon la
      // capacité côté serveur avant de confirmer.
    } finally {
      setLoadingCapacities(false);
    }
  }

  useEffect(() => {
    refreshCapacities();
    // Les disponibilités affichées se rafraîchissent régulièrement pour
    // rester crédibles si plusieurs clients réservent en même temps.
    const interval = setInterval(refreshCapacities, 20000);
    return () => clearInterval(interval);
  }, []);

  const canSubmit =
    roomNumber.trim().length > 0 &&
    guestCount >= 1 &&
    guestCount <= MAX_GUESTS_PER_ROOM &&
    timeSlotId !== null &&
    !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!timeSlotId || !canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const reservation = await createReservation({
        roomNumber,
        guestCount,
        timeSlotId,
        specialRequest,
      });
      router.push(`/confirmation/${reservation.id}`);
    } catch (err) {
      setError(formatServerError(err));
      setTimeSlotId(null); // le créneau visé n'est peut-être plus valide
      refreshCapacities();
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <div>
        <label
          htmlFor="room"
          className="block font-display text-lg font-medium text-charcoal"
        >
          Numéro de chambre
        </label>
        <input
          id="room"
          name="room"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          placeholder="Ex. 412"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-charcoal shadow-sm outline-none focus:border-burgundy"
        />
      </div>

      <div>
        <span className="block font-display text-lg font-medium text-charcoal">
          Nombre de personnes
        </span>
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
            aria-label="Retirer une personne"
            className="h-11 w-11 rounded-full border border-black/10 bg-white text-xl font-semibold text-burgundy shadow-sm transition active:scale-95"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="w-8 text-center font-display text-2xl font-medium text-charcoal"
          >
            {guestCount}
          </span>
          <button
            type="button"
            onClick={() =>
              setGuestCount((g) => Math.min(MAX_GUESTS_PER_ROOM, g + 1))
            }
            aria-label="Ajouter une personne"
            className="h-11 w-11 rounded-full border border-black/10 bg-white text-xl font-semibold text-burgundy shadow-sm transition active:scale-95"
          >
            +
          </button>
        </div>
        {guestCount > EXTRA_TABLE_THRESHOLD && (
          <p className="mt-2 rounded-lg bg-gold-light px-3 py-2 text-sm text-charcoal">
            ⚠️ Au-delà de {EXTRA_TABLE_THRESHOLD} personnes, votre réservation
            nécessitera deux tables.
          </p>
        )}
      </div>

      <div>
        <span className="block font-display text-lg font-medium text-charcoal">
          Créneau souhaité
        </span>
        {loadingCapacities ? (
          <p className="mt-3 text-sm text-charcoal-soft">
            Chargement des disponibilités…
          </p>
        ) : (
          <div className="mt-3">
            <TimeSlotPicker
              capacities={capacities}
              guestCount={guestCount}
              selected={timeSlotId}
              onSelect={setTimeSlotId}
            />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block font-display text-lg font-medium text-charcoal"
        >
          Demande particulière{" "}
          <span className="font-sans text-xs font-normal text-charcoal-soft">
            (facultatif)
          </span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          placeholder="Sans gluten, allergie, chaise haute…"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-charcoal shadow-sm outline-none focus:border-burgundy"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full bg-burgundy px-6 py-4 text-center font-display text-lg font-medium text-cream shadow-md transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Confirmation en cours…" : "Confirmer ma réservation"}
      </button>
    </form>
  );
}
