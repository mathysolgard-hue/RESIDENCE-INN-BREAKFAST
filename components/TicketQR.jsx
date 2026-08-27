'use client';

import { QRCodeSVG } from 'qrcode.react';

const SLOT_STYLES = {
  '07:30-08:15': { header: 'bg-amber-500', ring: 'ring-amber-300', label: 'Premier service' },
  '08:30-09:15': { header: 'bg-emerald-500', ring: 'ring-emerald-300', label: 'Deuxième service' },
  '09:30-10:15': { header: 'bg-sky-500', ring: 'ring-sky-300', label: 'Troisième service' },
};

export default function TicketQR({ reservation }) {
  const style = SLOT_STYLES[reservation.time_slot] || SLOT_STYLES['07:30-08:15'];
  const [start, end] = reservation.time_slot.split('-');

  return (
    <div className={`mx-auto max-w-sm overflow-hidden rounded-3xl bg-white shadow-ticket ring-4 ${style.ring}`}>
      <div className={`${style.header} px-6 py-5 text-white`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-85">
          {style.label} · Petit-déjeuner
        </p>
        <p className="mt-1 font-serif text-3xl font-semibold">
          {start} – {end}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-6">
        <div className="rounded-2xl border border-stone-100 p-3">
          <QRCodeSVG value={reservation.id} size={180} level="M" />
        </div>

        <div className="grid w-full grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-stone-100 py-3">
            <p className="text-xs text-stone-500">Chambre</p>
            <p className="text-xl font-bold">{reservation.room_number}</p>
          </div>
          <div className="rounded-xl bg-stone-100 py-3">
            <p className="text-xs text-stone-500">Personnes</p>
            <p className="text-xl font-bold">{reservation.guest_count}</p>
          </div>
        </div>

        {reservation.tables_needed > 1 && (
          <p className="w-full rounded-xl bg-stone-50 px-3 py-2 text-center text-xs text-stone-500">
            Votre groupe est installé sur 2 tables
          </p>
        )}

        {reservation.special_request && (
          <div className="w-full rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Demande : </span>
            {reservation.special_request}
          </div>
        )}

        <p className="text-center text-xs text-stone-400">
          Présentez ce code à l'entrée du restaurant.
          <br />
          Réservation n°{reservation.id.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
