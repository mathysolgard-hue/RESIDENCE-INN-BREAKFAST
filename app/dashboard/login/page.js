import LoginForm from '@/components/dashboard/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Residence Inn by Marriott · Lille
        </p>
        <h1 className="mt-2 text-center font-serif text-2xl font-semibold text-stone-900">
          Espace équipe
        </h1>
        <p className="mt-1 text-center text-sm text-stone-500">
          Petit-déjeuner — accès réservé au personnel
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
