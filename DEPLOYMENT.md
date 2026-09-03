# Déploiement (gratuit) — étape par étape

## 1. Supabase (base de données)
1. Créez un compte sur supabase.com > New project.
2. SQL Editor > New query > collez tout `supabase/schema.sql` > Run.
3. Authentication > Users > Add user : créez un compte par membre du
   personnel (email + mot de passe) qui utilisera le tableau de bord.
4. Project Settings > API : notez `Project URL` et la clé `anon public`.

## 2. Code sur GitHub
1. Créez un repo GitHub (vide).
2. Dans le dossier du projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/<votre-repo>.git
   git push -u origin main
   ```

## 3. Déploiement sur Vercel
1. vercel.com > connectez-vous avec GitHub > "Add New Project".
2. Sélectionnez le repo créé à l'étape 2.
3. Dans "Environment Variables", ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = l'URL notée à l'étape 1.4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé anon notée à l'étape 1.4
4. Cliquez Deploy. Au bout de 1-2 minutes, votre site est en ligne sur
   `https://<nom-du-projet>.vercel.app`.

## 4. Générer le QR code d'accès pour les chambres
Une fois en ligne, générez un QR code pointant vers l'URL Vercel (par
exemple avec le générateur intégré de Google ou n'importe quel générateur
de QR code gratuit) et affichez-le en chambre ou remettez-le au check-in.

## 5. Test du parcours complet
1. Ouvrez le site sur votre téléphone, faites une réservation test.
2. Vérifiez que le ticket avec QR code s'affiche.
3. Connectez-vous à `/admin/login` avec un des comptes créés à l'étape 1.3.
4. Vérifiez que la réservation test apparaît sur `/admin/dashboard`.
5. Sur `/admin/scanner`, scannez le QR (ou cherchez par numéro de chambre)
   et vérifiez l'affichage OK / STOP selon l'heure.

## Notes
- Chaque `git push` sur `main` redéploie automatiquement le site (CI/CD
  intégré à Vercel, gratuit).
- Pour un nom de domaine personnalisé, Vercel > Project > Settings >
  Domains.
- Pour changer la jauge de 34 tables, une seule ligne SQL à modifier dans
  Supabase (voir README.md).
