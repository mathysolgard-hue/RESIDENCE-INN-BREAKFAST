import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // En dev, un message clair vaut mieux qu'une erreur Supabase générique.
  console.warn(
    "Variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes. " +
      "Copiez .env.local.example vers .env.local et renseignez vos clés Supabase."
  );
}

// Cette clé "anon" est publique par conception (elle part dans le bundle du
// navigateur). La sécurité est assurée côté base de données par les
// policies RLS + les fonctions SECURITY DEFINER, pas par le secret de cette
// clé. Ne jamais utiliser la "service_role key" côté client.
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);
