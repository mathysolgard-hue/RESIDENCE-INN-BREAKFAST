import ReservationForm from "@/components/ReservationForm";
import BonvoyCallout from "@/components/BonvoyCallout";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-cream pb-16">
      <header className="bg-burgundy px-5 pt-10 pb-8 text-cream sm:px-8">
        <div className="mx-auto max-w-xl">
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-gold-light uppercase">
            Residence Inn by Marriott · Lille
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
            Bienvenue au petit-déjeuner
          </h1>
          <p className="mt-3 max-w-md text-sm text-cream/85 sm:text-base">
            Choisissez votre chambre, votre créneau, et présentez votre ticket
            à l&rsquo;entrée de la salle. Nous vous souhaitons un excellent
            séjour.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
            <span aria-hidden className="text-lg">
              🕚
            </span>
            <span>
              Départ (check-out) avant <strong>11h00</strong>. La réception
              reste à votre disposition pour toute prolongation.
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-4 max-w-xl space-y-6 px-5 sm:px-8">
        <section className="rounded-2xl bg-white px-5 py-6 shadow-md sm:px-7 sm:py-7">
          <h2 className="font-display text-xl font-medium text-charcoal">
            Réserver mon créneau
          </h2>
          <p className="mt-1 text-sm text-charcoal-soft">
            La réservation prend moins d&rsquo;une minute.
          </p>
          <div className="mt-6">
            <ReservationForm />
          </div>
        </section>

        <BonvoyCallout />

        <p className="text-center text-xs text-charcoal-soft">
          Une question ? La réception se fera un plaisir de vous aider.
        </p>
      </div>
    </main>
  );
}
