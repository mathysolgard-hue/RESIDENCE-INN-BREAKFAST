import { TIME_SLOTS } from "@/lib/slots";
import type { SlotCapacity } from "@/lib/types";

export default function CapacityGauge({ slot }: { slot: SlotCapacity }) {
  const meta = TIME_SLOTS.find((s) => s.id === slot.time_slot_id);
  const percent = Math.min(
    100,
    Math.round((slot.used_tables / Math.max(slot.max_tables, 1)) * 100)
  );
  const isFull = slot.used_tables >= slot.max_tables;

  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-base font-medium text-charcoal">
          {slot.label}
        </p>
        {isFull && (
          <span className="shrink-0 rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-white">
            COMPLET
          </span>
        )}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-charcoal">
        {slot.used_tables}
        <span className="text-base font-normal text-charcoal-soft">
          {" "}
          / {slot.max_tables} tables
        </span>
      </p>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cream-dim">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: isFull
              ? "var(--color-danger)"
              : `var(${meta?.colorVar ?? "--color-burgundy"})`,
          }}
        />
      </div>
    </div>
  );
}
