# Réservation petit-déjeuner — Residence Inn by Marriott Lille

Application de réservation de créneaux de petit-déjeuner : formulaire client
avec ticket QR code, tableau de bord staff en temps réel, scanner d'entrée.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** : base Postgres, authentification staff, temps réel
- **qrcode.react** : génération du QR code de confirmation
- **html5-qrcode** : lecture caméra du QR code côté staff

## Démarrage local

```bash
npm install
cp .env.local.example .env.local   # puis renseignez vos clés Supabase
npm run dev
```

## Mise en place de la base de données

1. Créez un projet sur supabase.com (gratuit).
2. Dans **SQL Editor**, collez et exécutez le contenu de `supabase/schema.sql`.
3. Dans **Authentication > Users**, créez un compte par membre du personnel
   devant accéder au tableau de bord / scanner (email + mot de passe).
4. Dans **Project Settings > API**, copiez `Project URL` et la clé
   `anon public` dans votre `.env.local`.

## Structure du projet

```
app/
  page.tsx                     Accueil + formulaire de réservation client
  confirmation/[id]/page.tsx   Ticket de confirmation (QR code)
  admin/login/page.tsx         Connexion staff
  admin/(protected)/dashboard  Tableau de bord temps réel
  admin/(protected)/scanner    Scanner d'entrée QR
components/                    Composants React réutilisables
lib/                           Client Supabase, types, logique métier
supabase/schema.sql            Schéma complet (tables, RLS, fonctions)
```

## Logique de capacité (34 tables / créneau)

Toute la logique "1 chambre = 1 table, sauf > 3 pers. = 2 tables" et la
limite de 34 tables par créneau vivent côté base de données
(`supabase/schema.sql`, fonction `create_reservation`), pas côté client.
La vérification et l'insertion sont atomiques (verrou par créneau + par
jour), donc deux clients qui réservent en même temps ne peuvent jamais
faire dépasser la jauge. Pour changer la capacité, une seule ligne à
modifier dans Supabase :

```sql
update public.time_slots set max_tables = 40 where id = '07:30-08:15';
```

Les réservations sont automatiquement rattachées à la date du jour
(heure de Paris) : la jauge se réinitialise seule chaque matin.

## Sécurité

- Le visiteur anonyme (client de l'hôtel) ne peut jamais lire la table des
  réservations : il passe uniquement par des fonctions SQL dédiées.
- Le personnel doit être connecté (Supabase Auth) pour lire la liste
  complète, voir les notes des clients, et pointer les arrivées.

## Marque / logo

Les couleurs (`app/globals.css`, section `@theme`) s'inspirent de
l'identité Residence Inn (bordeaux/or) mais ne sont pas les codes exacts
de la charte interne. Le logo officiel n'est pas inclus (droits Marriott) :
déposez votre fichier logo dans `public/` et intégrez-le si vous en avez
un usage autorisé en tant que collaborateur de l'hôtel.

Voir DEPLOYMENT.md pour la mise en ligne.
