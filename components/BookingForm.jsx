'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createReservation, getAvailability } from '@/lib/actions';

const initialState = { error: null };

const COLOR_MAP = {
  amber: {
    base: 'border-amber-300 bg-amber-50 text-amber-900',
    selected: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300',
    bar: 'bg-amber-500',
  },
  emerald: {
    base: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    selected: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300',
    bar: 'bg-emerald-500',
  },
  sky: {
    base: 'border-sky-300 bg-sky-50 text-sky-900',
    selected: 'border-sky-500 bg-sky-100 ring-2 ring-sky-300',
    bar: 'bg-sky-500',
  },
};

export default function BookingForm({ initialAvailability }) {
  const [state, formAction] = useFormState(createReservation, initialState);
  const [availability, setAvailability] = useState(initialAvailability);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [, startTransition] = useTransition();

  // Rafraîchit la disponibilité toutes les 15 secondes pour rester à jour
  // si d'autres clients réservent en même temps.
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        try {
          const data = await getAvailability();
          setAvailability(data);
        } catch {
          // silencieux : on garde l'affichage précédent en cas d'erreur réseau
        }
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const needsTwoTables = guestCount > 3;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="room_number" className="mb-1 block text-sm font-semibold text-stone-700">
          Numéro de chambre *
        </label>
        <input
          id="room_number"
          name="room_number"
          required
          type="text"
          inputMode="numeric"
          placeholder="Ex : 214"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div>
        <label htmlFor="guest_count" className="mb-1 block text-sm font-semibold text-stone-700">
          Nombre de personnes *
        </label>
        <input
          id="guest_count"
          name="guest_count"
          required
          type="number"
          min={1}
          max={10}
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value || '1', 10))}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
        />
        {needsTwoTables && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            ℹ️ Au-delà de 3 personnes, votre groupe nécessitera deux tables.
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-stone-700">
          Créneau horaire *
        </legend>
        <div className="grid grid-cols-1 gap-3">
          {availability.map((slot) => (
            <SlotOption
              key={slot.value}
              slot={slot}
              selected={selectedSlot === slot.value}
              onSelect={() => setSelectedSlot(slot.value)}
            />
          ))}
        </div>
        <input type="hidden" name="time_slot" value={selectedSlot || ''} />
      </fieldset>

      <div>
        <label htmlFor="special_request" className="mb-1 block text-sm font-semibold text-stone-700">
          Demande particulière <span className="font-normal text-stone-400">(optionnel)</span>
        </label>
        <textarea
          id="special_request"
          name="special_request"
          rows={3}
          placeholder="Sans gluten, allergie, chaise haute…"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <SubmitButton disabled={!selectedSlot} />
    </form>
  );
}

function SlotOption({ slot, selected, onSelect }) {
  const colors = COLOR_MAP[slot.color] || COLOR_MAP.emerald;
  const percent = slot.max > 0 ? Math.min(100, Math.round((slot.used / slot.max) * 100)) : 0;

  return (
    <button
      type="button"
      disabled={slot.isFull}
      aria-pressed={selected}
      onClick={onSelect}
      className={`relative flex items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition
        ${
          slot.isFull
            ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
            : selected
            ? colors.selected
            : `${colors.base} hover:brightness-95`
        }`}
    >
      <div>
        <p className="text-lg font-bold">{slot.label}</p>
        <p className="text-xs opacity-70">
          {slot.isFull ? 'Aucune table disponible' : `${slot.left} table(s) disponible(s) sur ${slot.max}`}
        </p>
      </div>

      {slot.isFull ? (
        <span className="rounded-full bg-stone-300 px-3 py-1 text-xs font-bold text-stone-600">
          COMPLET
        </span>
      ) : (
        <div className="h-2 w-16 overflow-hidden rounded-full bg-white/70">
          <div className={`h-full ${colors.bar}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </button>
  );
}

function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
    >
      {pending ? 'Réservation en cours…' : 'Confirmer ma réservation'}
    </button>
  );
}
