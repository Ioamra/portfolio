# Portfolio — Ioamra Monchau

Portfolio de développeur full-stack, conçu comme un vrai projet : contenu administrable,
base de données, authentification, tests end-to-end et auto-hébergement.

**[ioamra-monchau.fr](https://ioamra-monchau.fr)**

## Fonctionnalités

**Site public**

- Accueil avec un nom animé en particules (canvas 2D) et des cartes qui s'inclinent en 3D au
  mouvement de la souris.
- Projets filtrables par technologie, fiches détaillées en Markdown, carrousel d'images.
- Parcours (expériences, formations, compétences) et CV téléchargeable.
- Formulaire de contact : validation, envoi par e-mail, protection contre le spam (champ
  piège, limite d'envois par IP).
- Thème clair / sombre, transitions de page, accessibilité WCAG 2.1 AA.
- SEO : métadonnées Open Graph, images d'aperçu générées, sitemap, données structurées.

**Back-office**

- Connexion sécurisée (compte unique, limite de tentatives).
- Gestion du profil et du CV, des projets et de leurs images, du parcours, des compétences
  et des messages reçus.
- Chaque modification met à jour le site public immédiatement.

## Stack

|                  |                                                                              |
| ---------------- | ---------------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router, Server Components, Server Actions, Cache Components) |
| Langage          | TypeScript (strict)                                                          |
| Base de données  | PostgreSQL, Prisma 7 (schéma et migrations versionnés)                       |
| Authentification | Better Auth                                                                  |
| Validation       | Zod                                                                          |
| Interface        | Tailwind CSS 4, shadcn/ui (Base UI)                                          |
| E-mails          | Nodemailer (SMTP)                                                            |
| Tests            | Playwright (E2E) + axe-core (accessibilité)                                  |
| Déploiement      | Docker Compose, tunnel Cloudflare, Umami (statistiques)                      |

## Architecture

```
src/
  app/              routes : pages publiques, back-office, routes techniques (/cv, /media)
  components/       composants d'interface
  server/           code serveur uniquement (import "server-only")
    services/       logique métier et accès aux données (Prisma)
    actions/        Server Actions : authentification, validation, appel d'un service
  lib/              code partagé client / serveur (schémas Zod, formatage)
prisma/             schéma, migrations, données initiales
e2e/                tests Playwright, un fichier par page
```

Quelques choix techniques :

- **Architecture en couches.** Les pages et les Server Actions ne touchent jamais la base :
  elles passent par les services. Chaque action admin vérifie la session, valide les
  données avec Zod, puis appelle un service.
- **Cache explicite.** Les lectures publiques sont mises en cache et étiquetées
  (`"use cache"` + `cacheTag`). Les pages sont pré-rendues, et une modification dans
  l'admin n'invalide que les étiquettes concernées (`updateTag`).
- **Contraintes en base.** Unicité, cascades, et une contrainte `CHECK` écrite en SQL pour
  garantir l'unicité du profil.
- **Fichiers envoyés** contrôlés sur leurs premiers octets (et non sur l'extension),
  stockés hors du dépôt et servis sans exposer le reste du disque.

## Lancer le projet en local

Prérequis : Node.js 24, Docker.

```bash
docker compose up -d        # PostgreSQL (dev et tests) + Mailpit (boîte mail de test)
cp .env.example .env
npm install
npm run db:migrate          # applique les migrations
npm run db:seed             # contenu de démonstration
npm run admin:create -- admin@example.com "Admin"   # compte admin (mot de passe demandé)
npm run dev
```

- Site : <http://localhost:3000> — admin : <http://localhost:3000/admin>
- Mails envoyés par le formulaire de contact : <http://localhost:8025>

## Tests

```bash
npm run test:e2e
```

La suite (79 tests) tourne sur un **build de production** branché sur une base de test
dédiée, remise à zéro à chaque lancement. Elle couvre chaque page publique, le formulaire
de contact (mails vérifiés dans Mailpit), le back-office, les routes techniques (SEO,
fichiers servis, protections), et un audit d'accessibilité sur chaque page.

## Déploiement

Le site est auto-hébergé sur un serveur Debian, avec Docker Compose
(`docker-compose.prod.yml`) :

- `app` (Next.js), `db` (PostgreSQL), `umami` et sa base (statistiques sans cookie) ;
- `cloudflared` : un **tunnel Cloudflare** expose le site sans ouvrir aucun port sur le
  réseau local ; le HTTPS est géré par Cloudflare.

Le build Next.js se fait au **démarrage du conteneur**, et non pendant `docker build` : les
pages sont pré-rendues à partir de la base de données, qui doit donc être accessible. Au
démarrage, le conteneur applique les migrations, crée le contenu initial si la base est
vide, puis lance le build et le serveur (`docker/entrypoint.sh`).

```bash
cp .env.production.example .env.production   # puis renseigner les secrets
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Les sauvegardes (bases et fichiers) sont assurées par `scripts/backup.sh`, lancé chaque nuit.
Pour en garder une copie hors du serveur, depuis un PC Windows (cmd) :

```
scp -r <utilisateur>@<ip-du-serveur>:/srv/backups/portfolio %USERPROFILE%\Documents\backups-portfolio
```
