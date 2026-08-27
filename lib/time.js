// Définition unique des 3 créneaux de petit-déjeuner. Si un jour l'hôtel
// veut changer les horaires, c'est le seul endroit à modifier côté code
// (les capacités, elles, se modifient dans la table "capacites").
export const SLOTS = [
  { value: '07:30-08:15', label: '07h30 – 08h15', color: 'amber' },
  { value: '08:30-09:15', label: '08h30 – 09h15', color: 'emerald' },
  { value: '09:30-10:15', label: '09h30 – 10h15', color: 'sky' },
];

// Renvoie la date du jour (YYYY-MM-DD) dans le fuseau horaire de Lille,
// quel que soit le serveur (Vercel exécute souvent son code en UTC).
export function todayParis() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // format "en-CA" => YYYY-MM-DD
}

// Renvoie l'heure actuelle "HH:MM" à Lille.
export function nowTimeParis() {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Détermine dans quel créneau on se trouve actuellement (heure de Lille).
// Renvoie null si on est hors des heures de service (avant 7h30 / après 10h15).
export function currentSlotValue() {
  const nowM = timeToMinutes(nowTimeParis());
  for (const slot of SLOTS) {
    const [start, end] = slot.value.split('-');
    if (nowM >= timeToMinutes(start) && nowM <= timeToMinutes(end)) {
      return slot.value;
    }
  }
  return null;
}
