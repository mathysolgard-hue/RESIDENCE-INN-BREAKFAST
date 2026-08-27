import Link from 'next/link';
import { logoutAction } from '@/lib/actions';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-brand-700 text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-200">
              Residence Inn by Marriott · Lille
            </p>
            <p className="font-serif font-semibold">Espace petit-déjeuner</p>
          </div>
          <form action={logoutAction}>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20">
              Déconnexion
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-2 px-4 pb-3 text-sm">
          <Link href="/dashboard" className="rounded-full bg-white/10 px-4 py-1.5 transition hover:bg-white/20">
            Tableau de bord
          </Link>
          <Link href="/dashboard/scanner" className="rounded-full bg-white/10 px-4 py-1.5 transition hover:bg-white/20">
            Scanner
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
