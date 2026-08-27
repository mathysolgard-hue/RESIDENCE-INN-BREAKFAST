# 🥐 Petit-déjeuner — Residence Inn by Marriott Lille

Application web de réservation de créneaux de petit-déjeuner : espace client
(réservation + ticket QR) et espace employé (tableau de bord + scanner
d'entrée).

---

## 1. Architecture technique

| Brique | Choix | Pourquoi |
|---|---|---|
| Frontend + serveur | **Next.js 14** (App Router, JavaScript) | Un seul projet gère à la fois les pages et la logique serveur ("Server Actions"), pas besoin de créer une API séparée. Déploiement en 1 clic sur Vercel. |
| Base de données | **Supabase** (PostgreSQL managé) | Gratuit pour ce volume d'usage, interface graphique pour voir/éditer les données, fonctions SQL pour garantir qu'on ne dépasse jamais 34 tables même si deux clients réservent à la même seconde. |
| Style | **Tailwind CSS** | Permet un rendu mobile impeccable et une charte de couleurs cohérente sans écrire de CSS séparé. |
| QR code (génération) | **qrcode.react** | Génère le QR code du ticket client directement dans le navigateur. |
| QR code (scan) | **html5-qrcode** | Utilise la caméra d'une tablette/téléphone du personnel pour lire le QR code, sans application native. |
| Hébergement | **Vercel** (gratuit) | Optimisé pour Next.js, HTTPS automatique (nécessaire pour l'accès caméra), déploiement automatique à chaque mise à jour. |

**Sécurité :** le navigateur du client ne parle jamais directement à la base
de données. Toute la logique (vérifier la capacité, créer une réservation,
lister les réservations, scanner un QR code) passe par le serveur Next.js, qui
seul détient la clé secrète de Supabase. Le client ne peut donc jamais lire
les réservations des autres chambres, ni tricher sur les disponibilités.

L'espace employé est protégé par un mot de passe partagé (variable
d'environnement `STAFF_PASSWORD`), suffisant pour un usage interne à une
petite équipe. Une évolution possible plus tard : un compte par employé via
Supabase Auth (voir section "Pour aller plus loin").

---

## 2. Structure de la base de données

Deux tables (voir le détail commenté dans [`supabase/schema.sql`](./supabase/schema.sql)) :

### `capacites`
Nombre maximum de tables par créneau. Modifiable à tout moment depuis
l'interface Supabase si besoin d'ajuster la capacité un jour particulier.

| colonne | type | exemple |
|---|---|---|
| `time_slot` (clé primaire) | text | `07:30-08:15` |
| `label` | text | `07h30 – 08h15` |
| `max_tables` | integer | `34` |

### `reservations`
Une ligne = une réservation client.

| colonne | type | détail |
|---|---|---|
| `id` | uuid | identifiant unique, encodé dans le QR code |
| `reservation_date` | date | jour de la réservation |
| `room_number` | text | numéro de chambre |
| `guest_count` | integer | nombre de personnes (1 à 10) |
| `time_slot` | text | référence vers `capacites` |
| `tables_needed` | integer | 1, ou 2 si plus de 3 personnes |
| `special_request` | text | allergies, chaise haute, etc. |
| `status` | text | `confirmed`, `checked_in`, `cancelled`, `no_show` |
| `created_at` | timestamptz | horodatage de création |
| `checked_in_at` | timestamptz | horodatage du scan à l'entrée |

Une fonction SQL (`create_reservation`) verrouille la ligne de capacité
concernée le temps de vérifier et d'insérer la réservation : impossible que
deux réservations concurrentes fassent dépasser la limite de 34 tables,
même en cas de pic d'affluence au même moment.

---

## 3. Déploiement — étape par étape

Comptez environ **30 minutes** pour une première mise en ligne. Tout est
gratuit pour un usage d'un hôtel (Vercel Hobby + Supabase Free).

### Étape 1 — Créer le projet Supabase (la base de données)

1. Allez sur **[supabase.com](https://supabase.com)** et créez un compte gratuit.
2. Cliquez sur **New project**. Donnez-lui un nom (ex : `residence-inn-lille`),
   choisissez un mot de passe de base de données (gardez-le de côté, mais il
   ne sera pas réutilisé dans ce guide) et une région proche (ex : `eu-central`).
3. Une fois le projet créé, allez dans l'onglet **SQL Editor** (icône
   `</>` dans le menu de gauche) → **New query**.
4. Ouvrez le fichier [`supabase/schema.sql`](./supabase/schema.sql) fourni
   dans ce projet, copiez tout son contenu, collez-le dans l'éditeur SQL de
   Supabase, puis cliquez sur **Run**. Vous devez voir "Success. No rows returned".
5. Allez dans **Project Settings** (icône engrenage) → **API**. Notez :
   - **Project URL** (ressemble à `https://xxxxxxxx.supabase.co`)
   - **service_role key** (dans la section "Project API keys" — cliquez sur
     "Reveal" pour l'afficher). ⚠️ Cette clé est secrète, ne la partagez jamais
     publiquement.

### Étape 2 — Récupérer le code du projet

Téléchargez le fichier `residence-inn-breakfast.zip` fourni, puis décompressez-le.

**Option simple (recommandée) : passer par GitHub**

1. Créez un compte gratuit sur **[github.com](https://github.com)** si vous n'en avez pas.
2. Créez un nouveau dépôt (bouton vert **New**), nommez-le par exemple
   `residence-inn-lille-petit-dejeuner`, laissez-le en **Private** si vous
   préférez, puis cliquez sur **Create repository**.
3. Sur la page qui suit, suivez les instructions **"…or push an existing
   repository from the command line"**, ou plus simple : utilisez le bouton
   **"uploading an existing file"** sur GitHub pour glisser-déposer tout le
   contenu du dossier décompressé.

### Étape 3 — Déployer sur Vercel

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous avec votre
   compte GitHub.
2. Cliquez sur **Add New… → Project**, puis choisissez le dépôt GitHub que
   vous venez de créer.
3. Dans l'écran de configuration, avant de cliquer sur "Deploy", ouvrez la
   section **Environment Variables** et ajoutez :

   | Nom | Valeur |
   |---|---|
   | `SUPABASE_URL` | l'URL notée à l'étape 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clé `service_role` notée à l'étape 1 |
   | `STAFF_PASSWORD` | le mot de passe que l'équipe utilisera pour accéder au tableau de bord |

4. Cliquez sur **Deploy**. Après 1 à 2 minutes, Vercel vous donne une URL du
   type `https://residence-inn-lille-petit-dejeuner.vercel.app` — votre site
   est en ligne, en HTTPS, gratuitement.

### Étape 4 — Tester

- Ouvrez l'URL fournie par Vercel sur votre téléphone : vous devez voir la
  page de réservation. Faites une réservation test.
- Allez sur `.../dashboard/login`, connectez-vous avec le mot de passe
  choisi : vous devez voir la réservation test apparaître.
- Allez sur `.../dashboard/scanner`, autorisez l'accès à la caméra, et
  scannez le QR code affiché après la réservation test (affichez-le sur un
  second écran ou imprimez-le) : un grand **OK** vert doit apparaître si vous
  êtes dans le bon créneau, un **STOP** rouge sinon.

### Étape 5 — Générer le QR code d'accès pour les clients

Ce QR code est différent de celui du ticket : c'est celui que les clients
scanneront **en chambre ou à l'accueil** pour ouvrir le site. Il suffit
d'encoder l'URL Vercel (ex. `https://residence-inn-lille-petit-dejeuner.vercel.app`)
avec un générateur de QR code gratuit (par exemple en cherchant "générateur de
QR code gratuit" dans votre moteur de recherche), puis de l'imprimer sur les
cartes de bienvenue ou de le placer en chambre.

### Étape 6 (optionnelle) — Nom de domaine personnalisé

Si l'hôtel possède déjà un nom de domaine, l'onglet **Settings → Domains**
du projet Vercel permet d'y rattacher le site (ex :
`petit-dejeuner.residenceinnlille.fr`) gratuitement, en suivant les
instructions affichées (ajout d'un enregistrement DNS chez votre registrar).

---

## 4. Développement en local (optionnel, pour modifier le code)

Prérequis : [Node.js](https://nodejs.org) version 20 ou plus (recommandé pour
une compatibilité optimale avec les fonctions cryptographiques utilisées par
la connexion employé).

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'exemple et renseigner vos clés Supabase
cp .env.local.example .env.local
# puis éditez .env.local avec un éditeur de texte

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

---

## 5. Personnalisation courante

- **Changer le mot de passe employé** : modifiez la variable
  `STAFF_PASSWORD` dans Vercel (Project Settings → Environment Variables),
  puis redéployez (Vercel le fait automatiquement).
- **Changer la capacité (34 tables)** : dans Supabase → **Table Editor** →
  table `capacites`, modifiez directement la colonne `max_tables` pour un
  ou plusieurs créneaux.
- **Changer les horaires des créneaux** : à la fois dans la table
  `capacites` (colonnes `time_slot` et `label`) et dans le fichier
  `lib/time.js` (constante `SLOTS`), qui doivent rester cohérents.
- **Changer les couleurs** : fichier `tailwind.config.js`, section `colors.brand`.

---

## 6. Pour aller plus loin (évolutions possibles)

- Authentification individuelle du personnel (Supabase Auth) plutôt qu'un
  mot de passe partagé.
- Export CSV quotidien des réservations pour les cuisines.
- Notification automatique (email/SMS) de rappel avant le créneau.
- Ajout d'une préférence de langue (EN/FR) pour la clientèle internationale.
- Vue "historique" dans le tableau de bord pour consulter les jours passés
  (actuellement affiché : le jour même uniquement).

---

## 7. Coûts

- **Vercel Hobby** : gratuit (largement suffisant pour ce trafic).
- **Supabase Free** : gratuit jusqu'à 500 Mo de base de données et 50 000
  utilisateurs actifs mensuels — très largement suffisant ici (quelques
  centaines de réservations par jour représentent quelques Mo par an).

Aucune carte bancaire n'est requise pour démarrer sur ces deux plans gratuits.
