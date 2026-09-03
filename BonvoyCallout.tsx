const BENEFITS = [
  "Cumulez des points sur ce séjour, échangeables contre des nuits gratuites dans le monde entier",
  "Tarifs préférentiels réservés aux membres sur les prochains séjours",
  "Enregistrement et clé de chambre directement depuis l'application mobile",
  "Wi-Fi offert en réservant en direct sur les canaux Marriott",
];

export default function BonvoyCallout() {
  return (
    <section className="rounded-2xl bg-burgundy px-5 py-6 text-cream shadow-sm sm:px-7 sm:py-7">
      <p className="font-display text-xs font-semibold tracking-[0.2em] text-gold-light uppercase">
        Marriott Bonvoy
      </p>
      <h2 className="mt-1 font-display text-xl font-medium sm:text-2xl">
        Pourquoi devenir membre ?
      </h2>
      <p className="mt-2 text-sm text-cream/80">
        L&rsquo;adhésion est gratuite et immédiate — inutile d&rsquo;avoir une
        réservation en cours pour vous inscrire.
      </p>
      <ul className="mt-4 space-y-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-cream/90">
            <span aria-hidden className="mt-0.5 text-gold-light">
              ✦
            </span>
            {benefit}
          </li>
        ))}
      </ul>
      <a
        href="https://www.marriott.com/fr/loyalty/createAccount/createAccountPage1.mi"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gold-light"
      >
        Devenir membre Bonvoy
        <span aria-hidden>→</span>
      </a>
    </section>
  );
}
