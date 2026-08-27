import { createClient } from '@supabase/supabase-js';

// ATTENTION : ce fichier utilise la clé "service_role", qui contourne
// toutes les règles de sécurité (RLS) de Supabase. Il ne doit JAMAIS être
// importé depuis un composant client ("use client") — uniquement depuis des
// Server Actions ou des Server Components, qui s'exécutent sur le serveur.

let cachedClient = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Variables d\'environnement manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies (voir .env.local).'
    );
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}
