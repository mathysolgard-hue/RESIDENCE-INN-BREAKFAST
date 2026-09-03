"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthed(true);
      } else {
        router.replace("/admin/login");
      }
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <p className="text-sm text-charcoal-soft">Vérification de l&rsquo;accès…</p>
      </div>
    );
  }

  if (!authed) {
    return null; // redirection vers /admin/login en cours
  }

  return (
    <div className="min-h-dvh bg-cream">
      <nav className="flex flex-wrap items-center justify-between gap-3 bg-burgundy px-5 py-3 text-cream sm:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="font-display text-sm font-semibold tracking-wide">
            Espace personnel
          </span>
          <Link href="/admin/dashboard" className="text-sm hover:underline">
            Tableau de bord
          </Link>
          <Link href="/admin/scanner" className="text-sm hover:underline">
            Scanner
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm underline underline-offset-4"
        >
          Déconnexion
        </button>
      </nav>
      <div className="px-5 py-6 sm:px-8">{children}</div>
    </div>
  );
}
