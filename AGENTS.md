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

## Conventions

- **Couches** : un composant ou une Server Action n'appelle jamais Prisma directement. Une Server Action enchaîne : vérification d'auth (si admin) → validation Zod → appel d'un service → `revalidatePath`/`revalidateTag` → retour typé.
- **Server Components par défaut** ; `"use client"` uniquement quand il faut de l'interactivité (formulaires, toggle de thème, animations).
- Les pages publiques sont statiques/cachées et revalidées après chaque mutation dans l'admin.
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
