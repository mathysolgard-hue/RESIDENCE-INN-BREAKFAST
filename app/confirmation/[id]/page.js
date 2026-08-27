import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getReservationById } from '@/lib/actions';
import TicketQR from '@/components/TicketQR';

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({ params }) {
  const reservation = await getReservationById(params.id);

  if (!reservation) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-16 pt-10 text-center">
      <p className="text-4xl">✅</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">
        Réservation confirmée
      </h1>
      <p className="mt-1 text-stone-600">
        Présentez ce QR code à l'entrée du restaurant à l'heure indiquée.
      </p>

      <div className="mt-6">
        <TicketQR reservation={reservation} />
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm font-semibold text-brand-600 underline underline-offset-4"
      >
        ← Retour à l'accueil
      </Link>
    </main>
  );
}
