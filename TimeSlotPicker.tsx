"use client";

import { TIME_SLOTS, tablesNeededFor } from "@/lib/slots";
import type { SlotCapacity, TimeSlotId } from "@/lib/types";

interface TimeSlotPickerProps {
  capacities: SlotCapacity[];
  guestCount: number;
  selected: TimeSlotId | null;
  onSelect: (id: TimeSlotId) => void;
}

export default function TimeSlotPicker({
  capacities,
  guestCount,
  selected,
  onSelect,
}: TimeSlotPickerProps) {
  const neededForParty = tablesNeededFor(guestCount);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TIME_SLOTS.map((slot) => {
        const capacity = capacities.find((c) => c.time_slot_id === slot.id);
        const maxTables = capacity?.max_tables ?? 34;
        const usedTables = capacity?.used_tables ?? 0;
        const remaining = Math.max(maxTables - usedTables, 0);
        const isFull = remaining <= 0;
        const isTooSmallForParty = !isFull && remaining < neededForParty;
        const disabled = isFull || isTooSmallForParty;
        const isSelected = selected === slot.id;

        let statusText: string;
        if (isFull) {
          statusText = "COMPLET";
        } else if (isTooSmallForParty) {
          statusText = "Complet pour ce nombre de convives";
        } else {
          statusText = `${remaining} table${remaining > 1 ? "s" : ""} disponible${
            remaining > 1 ? "s" : ""
          }`;
        }

        return (
          <button
            key={slot.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(slot.id)}
            style={{
              borderLeftColor: `var(${slot.colorVar})`,
            }}
            className={`relative flex flex-col items-start gap-1 rounded-xl border-l-[6px] bg-white px-4 py-4 text-left shadow-sm transition
              ${
                disabled
                  ? "cursor-not-allowed opacity-50 grayscale"
                  : "cursor-pointer hover:shadow-md active:scale-[0.98]"
              }
              ${
                isSelected
                  ? "ring-2 ring-burgundy ring-offset-2 ring-offset-cream"
                  : "ring-1 ring-black/5"
              }`}
          >
            <span className="font-display text-lg font-medium text-charcoal">
              {slot.label}
            </span>
            <span
              className={`text-sm font-medium ${
                isFull || isTooSmallForParty ? "text-danger" : "text-charcoal-soft"
              }`}
            >
              {statusText}
            </span>
            {isFull && (
              <span className="absolute -top-2 -right-2 rounded-full bg-danger px-2 py-0.5 text-xs font-semibold tracking-wide text-white shadow">
                COMPLET
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
