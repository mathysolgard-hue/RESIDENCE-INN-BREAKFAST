export default function BonvoyBanner() {
  return (
    <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-bonvoy-600 via-bonvoy-500 to-bonvoy-400 p-6 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-200">
        Marriott Bonvoy®
      </p>
      <h3 className="mt-1 font-serif text-xl font-semibold">
        Devenez membre — c'est gratuit
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-white/90">
        <li>✓ Cumulez des points à chaque séjour, dans plus de 30 marques</li>
        <li>✓ Wifi gratuit et tarifs membres exclusifs</li>
        <li>✓ Enregistrement mobile et avantages selon votre statut</li>
      </ul>
      <a
        href="https://www.marriott.com/loyalty/createAccount/createAccountPage1.mi"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-bonvoy-600 transition hover:bg-gold-50"
      >
        Rejoindre Marriott Bonvoy →
      </a>
    </div>
  );
}
