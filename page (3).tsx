"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Identifiants incorrects. Merci de réessayer.");
      setLoading(false);
      return;
    }
    router.replace("/admin/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 shadow-md">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
          Residence Inn by Marriott
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium text-charcoal">
          Espace personnel
        </h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          Réservé au personnel de l&rsquo;hôtel.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-charcoal"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-base outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-charcoal"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-base outline-none focus:border-burgundy"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-burgundy px-6 py-3 font-display text-base font-medium text-cream transition hover:bg-burgundy-dark disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
