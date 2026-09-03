import { TIME_SLOTS } from "@/lib/slots";
import type { Reservation } from "@/lib/types";

const STATUS_STYLE: Record<Reservation["status"], string> = {
  confirmed: "bg-gold-light text-charcoal",
  checked_in: "bg-success/15 text-success",
  cancelled: "bg-black/5 text-charcoal-soft",
};

const STATUS_LABEL: Record<Reservation["status"], string> = {
  confirmed: "Confirmée",
  checked_in: "Pointée",
  cancelled: "Annulée",
};

export default function ReservationsTable({
  reservations,
}: {
  reservations: Reservation[];
}) {
  if (reservations.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-5 py-8 text-center text-sm text-charcoal-soft shadow-sm">
        Aucune réservation pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-cream-dim text-xs tracking-wide text-charcoal-soft uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Chambre</th>
            <th className="px-4 py-3 font-medium">Convives</th>
            <th className="px-4 py-3 font-medium">Créneau</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {reservations.map((r) => (
            <tr
              key={r.id}
              className={r.status === "cancelled" ? "opacity-40" : undefined}
            >
              <td className="px-4 py-3 font-medium text-charcoal">
                {r.room_number}
              </td>
              <td className="px-4 py-3 text-charcoal">
                {r.guest_count}
                {r.tables_needed > 1 && (
                  <span className="text-charcoal-soft"> (2 tables)</span>
                )}
              </td>
              <td className="px-4 py-3 text-charcoal">
                {TIME_SLOTS.find((s) => s.id === r.time_slot_id)?.label ??
                  r.time_slot_id}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLE[r.status]
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-charcoal-soft">
                {r.special_request || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
