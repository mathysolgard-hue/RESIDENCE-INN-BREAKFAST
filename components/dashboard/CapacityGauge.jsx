export default function CapacityGauge({ slot }) {
  const percent = slot.max > 0 ? Math.min(100, Math.round((slot.used / slot.max) * 100)) : 0;
  const barColor = slot.isFull ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-stone-800">{slot.label}</p>
        {slot.isFull && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
            COMPLET
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-bold text-stone-900">
        {slot.used} <span className="text-sm font-normal text-stone-400">/ {slot.max} tables</span>
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
