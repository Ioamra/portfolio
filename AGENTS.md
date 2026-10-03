# AGENTS.md

Contexte technique du projet pour les agents IA et les contributeurs.

## Projet

Portfolio / CV numérique d'un développeur web full-stack orienté back (recherche de CDI).
Public visé : recruteurs RH et développeurs. Site en **français uniquement**.
Le repo GitHub est public et sert lui-même de démonstration technique : la qualité du code, du schéma de données et des tests compte autant que le rendu.

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js (App Router), full-stack — pas de back séparé |
| Langage | TypeScript strict (obligatoire, pas de `any`) |
| Style | Tailwind CSS + shadcn/ui, thème clair/sombre via `next-themes` |
| Animations | Sans bibliothèque : canvas 2D, CSS, View Transitions de React |
| BDD | PostgreSQL |
| ORM | Prisma (schéma dans `prisma/schema.prisma`, migrations versionnées) |
| Validation | Zod (schémas partagés formulaires ↔ serveur) |
| Auth | Better Auth, un seul compte admin |
| Mail | Nodemailer via SMTP externe (Brevo en prod, Mailpit en dev/test) |
| Tests | Playwright E2E, un fichier de spec par page |
| Stats de visite | Umami auto-hébergé (script externe, rien dans le code métier) |
| Package manager | npm |

## Architecture

```
prisma/
  schema.prisma        modèle de données
  migrations/
  seed.ts              données de démo (textes provisoires)
src/
  app/
    (public)/          pages publiques : /, /projets, /projets/[slug], /parcours, /contact, /mentions-legales
    admin/connexion/   page de connexion
    admin/(protected)/ back-office : tableau de bord, profil & CV, projets (+ images), parcours, compétences, messages
    api/auth/          routes Better Auth
    cv/                GET /cv : téléchargement du CV
    media/             GET /media/projects/... : images des projets
  components/
    ui/                composants shadcn/ui (générés, modifier avec parcimonie)
    ...                composants applicatifs
  server/              code serveur uniquement (import "server-only")
    env.ts             variables d'environnement validées par Zod
    db.ts              client Prisma singleton
    auth.ts            config Better Auth
    auth-guard.ts      requireAdminPage() / requireAdminAction()
    storage.ts         accès au dossier de stockage (anti path traversal)
    uploads.ts         envoi de fichiers : taille, type réel (octets), écriture
    mail.ts            envoi de mails
    services/          logique métier + requêtes Prisma (équivalent des services NestJS)
    actions/           Server Actions : fines, elles orchestrent seulement (admin/ : une par domaine)
  lib/
    validation/        schémas Zod (contact, admin)
    form-state.ts      type FormState + parseFormData() partagés par les actions
scripts/
  create-admin.ts      création du compte admin / changement de mot de passe
e2e/                   tests Playwright
docker-compose.yml     dev : postgres, postgres de test, mailpit
```

## Démarrage en local

```bash
docker compose up -d   # db (port 5434), db-test (5433), mailpit (SMTP 1025, UI http://localhost:8025)
cp .env.example .env
npm install            # lance aussi prisma generate
npm run db:migrate     # applique les migrations
npm run db:seed        # contenu initial (repris du CV)
npm run admin:create -- <email> "<Nom>"   # compte admin (mot de passe demandé)
npm run dev            # admin : http://localhost:3000/admin
```

Autres scripts : `db:reset` (repart de zéro), `db:studio` (explorateur de données), `lint`, `format`.

## Base de données

- Prisma **7** avec le driver adapter `@prisma/adapter-pg` ; client généré dans `src/generated/prisma` (ignoré par Git), import via `@/generated/prisma/client`.
- Versions Prisma **épinglées** (`prisma`, `@prisma/client`, `@prisma/adapter-pg` identiques) : le tag npm `latest` a pointé vers une RC 8.x incompatible.
- `prisma init` télécharge des « skills » d'agents (`.agents/`, `.claude/`, `.windsurf/`) : ne pas les committer.
- Le port 5432 est pris par un PostgreSQL local sur la machine de dev, d'où le 5434.
- Contraintes non exprimables en Prisma (ex. `CHECK`) : migration créée avec `prisma migrate dev --create-only` puis SQL écrit à la main.
- `prisma migrate dev` refuse de tourner hors terminal interactif quand une migration supprime des données. Contournement : créer le dossier `prisma/migrations/<horodatage>_<nom>/`, y écrire la sortie de `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, puis `prisma migrate deploy`.
- `profile` est une table à ligne unique (id = 1, contrainte `profile_singleton`).
- `prisma/seed.ts` tourne hors de Next : il instancie son propre client et ne doit rien importer de `src/server` (`server-only`).

## Conventions

- **Couches** : un composant ou une Server Action n'appelle jamais Prisma directement. Une Server Action enchaîne : vérification d'auth (si admin) → validation Zod → appel d'un service → `revalidatePath`/`revalidateTag` → retour typé.
- **Server Components par défaut** ; `"use client"` uniquement quand il faut de l'interactivité (formulaires, toggle de thème, animations).
- **Cache Components** activé (`cacheComponents: true`) : les services de lecture publics utilisent `"use cache"` + `cacheLife("max")` + `cacheTag(...)` (tags dans `src/server/cache-tags.ts`). Les mutations admin appellent `updateTag` sur les tags concernés. Conséquence : `next build` pré-rend les pages et **a besoin d'accéder à la base**.
- Pas de `Date.now()` / `new Date()` / `Math.random()` dans le rendu (interdit par Cache Components hors `"use cache"` ou `connection()`).
- Dates `@db.Date` formatées en UTC (`src/lib/format.ts`).
- shadcn/ui utilise ici **Base UI** (style `base-nova`) et non Radix : composition via la prop `render` (pas `asChild`). Pour un lien stylé en bouton, utiliser `ButtonLink` (`components/button-link.tsx`) et non `<Button render={<Link />}>`, qui ajoute `role="button"`.
- `cn` vient du paquet officiel `cn` (shadcn), réexporté par `src/lib/utils.ts`.
- lucide-react 1.x n'a plus les logos de marques : ils sont dans `src/components/icons.tsx`.
- Animations sans bibliothèque : nom en particules (canvas 2D, `components/home/particle-name.tsx`), cartes inclinables (`components/tilt-card.tsx`, variables CSS, pas de re-rendu), apparition au scroll en CSS (`.reveal`, scroll-driven animations), transitions de page via `<ViewTransition>` de React (`components/page-transition.tsx`, à mettre dans chaque `page.tsx`, pas dans un layout). Toujours respecter `prefers-reduced-motion`.
- Pas de `filter`/`backdrop-filter`/`overflow-hidden` entre une `TiltCard` et les enfants en `translateZ` : ça aplatit le relief 3D.
- `<meta name="darkreader-lock">` dans le layout racine : empêche l'extension Dark Reader de modifier le DOM (erreurs d'hydratation).
- Protection de `/admin` : vérification de session côté serveur dans le layout admin **et** dans chaque Server Action (ne jamais se fier uniquement au middleware/proxy).
- Fichiers uploadés (images, CV) stockés sur disque dans `STORAGE_DIR` (défaut `storage/`, ignoré par Git, volume Docker en prod), jamais en base ni dans le repo. Accès via `server/storage.ts` (protège contre les chemins qui sortent du dossier). Le CV contient des données personnelles : **ne jamais le committer**.
- CV téléchargeable via la route `GET /cv` (`app/cv/route.ts`, dynamique via `connection()`), nom de fichier dérivé du nom du profil. Le seed ne référence `cv/cv.pdf` que si le fichier existe dans le stockage.
- Aucune donnée personnelle sensible (adresse, téléphone, date de naissance) sur les pages du site.
- Formulaire de contact (`app/(public)/contact`, action `server/actions/contact.action.ts`) : champ piège `website` (rempli = faux succès, rien n'est enregistré), limite de 3 messages / 10 min / IP en mémoire (`server/rate-limit.ts`, valable pour une seule instance). Le message est **d'abord enregistré en base**, puis envoyé par mail en texte brut avec `replyTo` = l'expéditeur ; un échec SMTP est journalisé sans faire échouer l'envoi.
- Validation côté serveur uniquement (`noValidate`), schémas Zod dans `lib/validation/`, messages en français.
- Next insère un `role="alert"` (annonceur de route) : dans les tests, cibler les alertes par leur texte.
- Nommage : code en anglais, contenu, routes et libellés UI en français.
- Accessibilité : contrastes valides dans les deux thèmes, navigation clavier, `alt` sur toutes les images.

## SEO et métadonnées

- `SITE_URL` (URL publique) sert à la fois à `metadataBase`, au sitemap, à robots.txt, au JSON-LD et à Better Auth.
- Métadonnées de base dans `app/layout.tsx` (titre, description tronquée par `excerpt()`, Open Graph). **Pas** de `canonical` ni d'`openGraph.url` dans un layout : un enfant en hériterait. Chaque page déclare son `alternates.canonical`.
- Le bloc `openGraph` d'une page remplace entièrement celui du layout (pas de fusion).
- Images générées (`server/metadata-images.tsx`, Satori) : `opengraph-image.tsx` (site + un par projet), `icon.tsx` / `apple-icon.tsx` (initiales). Satori : `display: flex` sur tout bloc à plusieurs enfants, pas de motif de fond répété, pas de gras sans police chargée.
- `robots.ts` exclut `/admin` et `/api` ; `sitemap.ts` liste les pages et les projets publiés (cache taggé `projects`).
- JSON-LD « Person » sur l'accueil (`components/person-json-ld.tsx`, `<` échappé).
- Pages d'erreur : `app/not-found.tsx` (404 globale avec en-tête et pied), `(public)/error.tsx`, `app/global-error.tsx`.
- Mentions légales : `(public)/mentions-legales`. La durée de conservation des messages (`MESSAGE_RETENTION_MONTHS`) y est affichée **et** appliquée : purge à chaque nouveau message.
- Accessibilité vérifiée avec `@axe-core/playwright` (WCAG 2.1 AA, thèmes clair et sombre).

## Admin

- Auth : Better Auth, e-mail + mot de passe, **inscription désactivée** (`disableSignUp`). Le compte unique est créé par `scripts/create-admin.ts` (instance Better Auth dédiée où l'inscription est permise) ; relancer le script avec la même adresse change le mot de passe et ferme les sessions.
- Tables `users`, `sessions`, `accounts`, `verifications` : champs imposés par Better Auth (voir `getAuthTables()`).
- Limite de connexion : 5 essais / minute / IP (`rateLimit.customRules`), IP lue dans `cf-connecting-ip`.
- Garde : le layout `admin/(protected)` vérifie la session dans un composant sous `<Suspense>` ; **chaque** Server Action admin commence par `await requireAdminAction()`. Pas de `proxy.ts`.
- `export const instant = false` sur le layout protégé : l'admin est rendu à chaque requête (la nav lit `usePathname()`).
- Lectures admin **sans cache** (`list…ForAdmin`, `get…ForAdmin`) : l'admin voit les brouillons et l'état réel. Les mutations appellent `updateTag` sur les tags publics concernés ; les messages (jamais publics) utilisent `refresh()`.
- Formulaires admin : `<AdminForm>` soumet via `onSubmit` + `startTransition` (pas `<form action>`, qui viderait les champs en cas d'erreur) ; erreurs par champ transmises aux `<FormField>` par contexte.
- Erreurs métier : `ConflictError(field)` (contrainte d'unicité) traduite en erreur de champ par `toErrorState()`.
- Fichiers : 5 Mo max (`serverActions.bodySizeLimit: "6mb"`), type vérifié sur les premiers octets (JPEG/PNG/WebP, PDF). Images : `projects/<id>/<uuid>.<ext>`, servies par `/media` avec cache long (noms jamais réutilisés). Suppression d'un projet = suppression de son dossier.

## Tests

- Playwright E2E, un fichier par page, couvrant toutes les fonctionnalités de la page.
- Base de test dédiée, réinitialisée et seedée avant la suite.
- Les mails sont vérifiés via l'API de Mailpit.

## Déploiement

- Serveur perso sous Debian, tout en Docker Compose : app Next (build `standalone`), PostgreSQL, Umami.
- Exposition via Cloudflare Tunnel (aucun port ouvert sur la box, HTTPS géré).
- Pas de CI/CD ni de déploiement automatique.

## Git

- Aucune ligne `Co-Authored-By` ni mention d'outil IA dans les commits ou les PR.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
