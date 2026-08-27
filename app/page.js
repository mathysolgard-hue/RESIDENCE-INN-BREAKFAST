import { getAvailability } from '@/lib/actions';
import BookingForm from '@/components/BookingForm';
import BonvoyBanner from '@/components/BonvoyBanner';
import HotelInfo from '@/components/HotelInfo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const availability = await getAvailability();

  return (
    <main className="mx-auto max-w-lg px-4 pb-16 pt-10">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
          Residence Inn by Marriott® · Lille
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900">Bienvenue !</h1>
        <p className="mt-2 text-stone-600">
          Réservez votre créneau de petit-déjeuner en quelques secondes.
        </p>
      </header>

      <HotelInfo />
      <BonvoyBanner />

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-stone-100">
        <h2 className="mb-4 font-serif text-xl font-semibold text-stone-900">
          Réserver une table
        </h2>
        <BookingForm initialAvailability={availability} />
      </section>

      <p className="mt-8 text-center text-xs text-stone-400">
        Une question ? Contactez la réception de l'hôtel.
      </p>
    </main>
  );
}
