'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/actions';

const initialState = { error: null };

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <input
        type="password"
        name="password"
        required
        placeholder="Mot de passe équipe"
        className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700 disabled:bg-stone-300"
    >
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  );
}
