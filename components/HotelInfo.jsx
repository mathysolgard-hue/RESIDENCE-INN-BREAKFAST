export default function HotelInfo() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-stone-100">
        <p className="text-2xl">🕚</p>
        <p className="mt-1 text-sm font-semibold text-stone-800">Check-out à 11h00</p>
      </div>
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-stone-100">
        <p className="text-2xl">☕</p>
        <p className="mt-1 text-sm font-semibold text-stone-800">Service de 7h30 à 10h15</p>
      </div>
    </div>
  );
}
