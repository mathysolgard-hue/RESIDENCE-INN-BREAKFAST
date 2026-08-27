// Système d'authentification volontairement simple : un seul mot de passe
// partagé par l'équipe (STAFF_PASSWORD), stocké dans les variables
// d'environnement du serveur, jamais dans le code ni dans le navigateur.
//
// Au lieu de stocker le mot de passe en clair dans le cookie de session, on
// stocke son empreinte SHA-256. Cette fonction utilise l'API Web Crypto
// (crypto.subtle), disponible à la fois dans Node.js (Server Actions) et
// dans le runtime Edge (middleware.js) — contrairement au module "crypto"
// de Node, qui lui ne fonctionne pas dans le middleware Edge.

export const STAFF_COOKIE_NAME = 'ri_staff_session';

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getExpectedSessionValue() {
  const secret = process.env.STAFF_PASSWORD || '';
  return sha256Hex(`residence-inn-staff-session:${secret}`);
}
