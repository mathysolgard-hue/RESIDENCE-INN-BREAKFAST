import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl">🔍</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">Page introuvable</h1>
      <p className="mt-1 text-stone-500">Ce lien de réservation n'existe pas ou plus.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-600 px-6 py-2 font-semibold text-white"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}
