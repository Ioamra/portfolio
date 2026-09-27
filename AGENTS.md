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
| Animations | Motion (ex-Framer Motion), discrètes |
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
    admin/             back-office protégé : login, projets, expériences, compétences, profil, messages, CV
    api/               route handlers (auth, fichiers uploadés)
  components/
    ui/                composants shadcn/ui (générés, modifier avec parcimonie)
    ...                composants applicatifs
  server/              code serveur uniquement (import "server-only")
    env.ts             variables d'environnement validées par Zod
    db.ts              client Prisma singleton
    auth.ts            config Better Auth
    mail.ts            envoi de mails
    services/          logique métier + requêtes Prisma (équivalent des services NestJS)
    actions/           Server Actions : fines, elles orchestrent seulement
  lib/
    validation/        schémas Zod
e2e/                   tests Playwright
docker-compose.yml     dev : postgres, postgres de test, mailpit
```

## Démarrage en local

```bash
docker compose up -d   # db (port 5434), db-test (5433), mailpit (SMTP 1025, UI http://localhost:8025)
cp .env.example .env
npm install            # lance aussi prisma generate
npm run db:migrate     # applique les migrations
npm run db:seed        # données de démo
npm run dev
```

Autres scripts : `db:reset` (repart de zéro), `db:studio` (explorateur de données), `lint`, `format`.

## Base de données

- Prisma **7** avec le driver adapter `@prisma/adapter-pg` ; client généré dans `src/generated/prisma` (ignoré par Git), import via `@/generated/prisma/client`.
- Versions Prisma **épinglées** (`prisma`, `@prisma/client`, `@prisma/adapter-pg` identiques) : le tag npm `latest` a pointé vers une RC 8.x incompatible.
- `prisma init` télécharge des « skills » d'agents (`.agents/`, `.claude/`, `.windsurf/`) : ne pas les committer.
- Le port 5432 est pris par un PostgreSQL local sur la machine de dev, d'où le 5434.
- Contraintes non exprimables en Prisma (ex. `CHECK`) : migration créée avec `prisma migrate dev --create-only` puis SQL écrit à la main.
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
- Fichiers uploadés (images, CV) stockés sur disque dans un dossier monté en volume Docker, jamais en base.
- Formulaire de contact : champ honeypot + rate limiting ; le message est enregistré en base puis envoyé par mail.
- Nommage : code en anglais, contenu, routes et libellés UI en français.
- Accessibilité : contrastes valides dans les deux thèmes, navigation clavier, `alt` sur toutes les images.

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
