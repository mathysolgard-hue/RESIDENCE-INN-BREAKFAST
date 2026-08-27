'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAvailability, listReservations, updateReservationStatus } from '@/lib/actions';
import CapacityGauge from './CapacityGauge';

const STATUS_STYLES = {
  confirmed: { label: 'Confirmé', classes: 'bg-sky-100 text-sky-700' },
  checked_in: { label: 'Arrivé', classes: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulé', classes: 'bg-red-100 text-red-700' },
  no_show: { label: 'Absent', classes: 'bg-stone-200 text-stone-600' },
};

export default function DashboardClient({ initialAvailability, initialReservations, date }) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [reservations, setReservations] = useState(initialReservations);
  const [filterSlot, setFilterSlot] = useState('all');
  const [, startTransition] = useTransition();

  // Rafraîchit les données toutes les 7 secondes ("temps réel" par sondage,
  // simple et fiable, sans dépendre de WebSockets).
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        try {
          const [a, r] = await Promise.all([getAvailability(date), listReservations(date)]);
          setAvailability(a);
          setReservations(r);
        } catch {
          // silencieux : on retentera au prochain cycle
        }
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [date]);

  const filtered =
    filterSlot === 'all' ? reservations : reservations.filter((r) => r.time_slot === filterSlot);

  async function handleAction(id, status) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateReservationStatus(id, status);
    } catch {
      // en cas d'erreur, le prochain rafraîchissement corrigera l'affichage
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {availability.map((slot) => (
          <CapacityGauge key={slot.value} slot={slot} />
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-4">
          <h2 className="font-serif text-lg font-semibold text-stone-900">
            Réservations du{' '}
            {new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <FilterButton active={filterSlot === 'all'} onClick={() => setFilterSlot('all')}>
              Tous
            </FilterButton>
            {availability.map((s) => (
              <FilterButton
                key={s.value}
                active={filterSlot === s.value}
                onClick={() => setFilterSlot(s.value)}
              >
                {s.label}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-2">Chambre</th>
                <th className="px-4 py-2">Pers.</th>
                <th className="px-4 py-2">Créneau</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Aucune réservation pour le moment
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const status = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
                return (
                  <tr key={r.id} className="border-t border-stone-100">
                    <td className="px-4 py-2 font-semibold">{r.room_number}</td>
                    <td className="px-4 py-2">
                      {r.guest_count}
                      {r.tables_needed > 1 && (
                        <span className="ml-1 text-xs text-amber-600">(2 tables)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{r.time_slot}</td>
                    <td
                      className="max-w-[160px] truncate px-4 py-2 text-stone-500"
                      title={r.special_request || ''}
                    >
                      {r.special_request || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        {r.status !== 'checked_in' && (
                          <button
                            onClick={() => handleAction(r.id, 'checked_in')}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                          >
                            Arrivé
                          </button>
                        )}
                        {r.status !== 'cancelled' && (
                          <button
                            onClick={() => handleAction(r.id, 'cancelled')}
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 transition ${
        active ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
    >
      {children}
    </button>
  );
}
