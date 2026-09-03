import Link from "next/link";
import { headers } from "next/headers";
import ConfirmationTicket from "@/components/ConfirmationTicket";
import { getReservationById } from "@/lib/reservations";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservationById(id).catch(() => null);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        {reservation ? (
          <ConfirmationTicket reservation={reservation} origin={origin} />
        ) : (
          <div className="rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
            <p className="font-display text-xl font-medium text-charcoal">
              Réservation introuvable
            </p>
            <p className="mt-2 text-sm text-charcoal-soft">
              Ce lien ne correspond à aucune réservation active. Merci de
              refaire une réservation depuis l&rsquo;accueil.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-cream"
            >
              Retour à l&rsquo;accueil
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
