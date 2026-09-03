"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { TIME_SLOTS } from "@/lib/slots";
import type { Reservation } from "@/lib/types";

export default function ConfirmationTicket({
  reservation,
  origin,
}: {
  reservation: Reservation;
  origin: string;
}) {
  const slot = TIME_SLOTS.find((s) => s.id === reservation.time_slot_id);
  const colorVar = slot?.colorVar ?? "--color-burgundy";
  const qrValue = `${origin}/confirmation/${reservation.id}`;
  const shortCode = reservation.id.slice(0, 8).toUpperCase();

  return (
    <div>
      <p className="mb-4 text-center font-display text-xl font-medium text-charcoal">
        Réservation confirmée
      </p>

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
        {/* Bandeau couleur du créneau */}
        <div
          className="px-6 py-4 text-cream"
          style={{ backgroundColor: `var(${colorVar})` }}
        >
          <p className="font-display text-xs font-semibold tracking-[0.2em] uppercase opacity-90">
            Petit-déjeuner · Residence Inn Lille
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {slot?.label ?? reservation.time_slot_id}
          </p>
        </div>

        {/* Corps du ticket */}
        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-medium tracking-wide text-charcoal-soft uppercase">
              Chambre
            </p>
            <p className="font-display text-3xl font-medium text-charcoal">
              {reservation.room_number}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-charcoal-soft uppercase">
              Convives
            </p>
            <p className="font-display text-3xl font-medium text-charcoal">
              {reservation.guest_count}
            </p>
          </div>
          {reservation.tables_needed > 1 && (
            <p className="col-span-2 -mt-2 text-xs text-charcoal-soft">
              Réparti sur {reservation.tables_needed} tables
            </p>
          )}
          {reservation.special_request && (
            <div className="col-span-2 rounded-lg bg-gold-light px-3 py-2">
              <p className="text-xs font-medium tracking-wide text-charcoal-soft uppercase">
                Demande particulière
              </p>
              <p className="text-sm text-charcoal">
                {reservation.special_request}
              </p>
            </div>
          )}
        </div>

        {/* Perforation */}
        <div className="ticket-perforation h-4 w-full" />

        {/* Talon avec QR code */}
        <div className="flex flex-col items-center gap-3 bg-cream-dim px-6 py-6">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <QRCodeSVG value={qrValue} size={168} />
          </div>
          <p className="font-mono text-sm tracking-widest text-charcoal-soft">
            {shortCode}
          </p>
          <p className="max-w-[220px] text-center text-xs text-charcoal-soft">
            Présentez ce ticket (ou ce QR code) à l&rsquo;entrée de la salle,
            sur votre créneau.
          </p>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-sm font-medium text-burgundy underline underline-offset-4"
      >
        Faire une nouvelle réservation
      </Link>
    </div>
  );
}
