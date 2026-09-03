"use client";

import { useEffect, useState } from "react";
import CapacityGauge from "@/components/CapacityGauge";
import ReservationsTable from "@/components/ReservationsTable";
import { getSlotCapacity, listReservations } from "@/lib/reservations";
import { supabase } from "@/lib/supabase";
import type { Reservation, SlotCapacity, TimeSlotId } from "@/lib/types";

export default function DashboardPage() {
  const [capacities, setCapacities] = useState<SlotCapacity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TimeSlotId | "all">("all");

  async function refresh() {
    const [cap, res] = await Promise.all([getSlotCapacity(), listReservations()]);
    setCapacities(cap);
    setReservations(res);
    setLoading(false);
  }

  useEffect(() => {
    refresh();

    // Toute création, mise à jour (pointage) ou annulation se répercute
    // immédiatement ici, sans que le personnel ait besoin de rafraîchir.
    const channel = supabase
      .channel("reservations-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.time_slot_id === filter);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal">
          Tableau de bord
        </h1>
        <p className="text-sm text-charcoal-soft">
          Réservations d&rsquo;aujourd&rsquo;hui, mises à jour en direct.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-soft">Chargement…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {capacities.map((c) => (
              <CapacityGauge key={c.time_slot_id} slot={c} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              Tous ({reservations.length})
            </FilterButton>
            {capacities.map((c) => (
              <FilterButton
                key={c.time_slot_id}
                active={filter === c.time_slot_id}
                onClick={() => setFilter(c.time_slot_id)}
              >
                {c.label}
              </FilterButton>
            ))}
          </div>

          <ReservationsTable reservations={filtered} />
        </>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-burgundy text-cream"
          : "bg-white text-charcoal-soft shadow-sm hover:bg-cream-dim"
      }`}
    >
      {children}
    </button>
  );
}
