/**
 * Données initiales du site, reprises du CV (modifiables ensuite via l'admin).
 * Idempotent : vide les tables de contenu puis les remplit à nouveau.
 * Lancement : npm run db:seed
 */
import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type SkillCategory } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Le CV n'est pas versionné (données personnelles) : on ne le référence que s'il a été
// déposé dans le stockage local.
const CV_PATH = "cv/cv.pdf";
const cvAvailable = existsSync(path.resolve(process.env.STORAGE_DIR ?? "storage", CV_PATH));

const skills: Record<SkillCategory, string[]> = {
  LANGUAGE: ["TypeScript", "JavaScript", "PHP", "SQL", "HTML", "CSS", "Python", "Java"],
  FRONTEND: ["Angular", "React", "Next.js", "Capacitor"],
  BACKEND: ["NestJS", "Express"],
  DATABASE: ["PostgreSQL", "MySQL", "pgModeler", "TypeORM", "Prisma", "FileMaker"],
  DEVOPS: [],
  TOOLS: ["Vitest", "Playwright", "Git", "GitLab CI/CD"],
};

function connect(...names: string[]) {
  return { connect: names.map((name) => ({ name })) };
}

async function main() {
  await db.$transaction([
    db.projectImage.deleteMany(),
    db.project.deleteMany(),
    db.experience.deleteMany(),
    db.skill.deleteMany(),
    db.contactMessage.deleteMany(),
    db.profile.deleteMany(),
  ]);

  await db.profile.create({
    data: {
      fullName: "Ioamra Monchau",
      headline: "Développeur Full-Stack · Angular / NestJS",
      bio: "Titulaire d'un titre RNCP de niveau 7 « Chef de projet Système d'Information » après 3 ans d'alternance comme développeur full-stack, je recherche un poste de développeur full-stack. Ma formation de chef de projet m'apporte une vision globale des projets : compréhension des besoins métier, conception des données et cohérence de l'architecture.",
      location: "Près d'Aix-en-Provence (13)",
      availability: "En recherche d'un poste de développeur full-stack",
      strengths: [
        "Analyser les besoins métier et rédiger un cahier des charges",
        "Concevoir et modéliser une base de données",
        "Développer des applications front-end et back-end",
        "Piloter un projet SI, de la conception au déploiement",
        "Rédiger une documentation technique",
        "Analyser des problèmes techniques et mettre en place des mesures correctives",
      ],
      githubUrl: "https://github.com/ioamra",
      linkedinUrl: "https://www.linkedin.com/in/ioamra-monchau/",
      cvPath: cvAvailable ? CV_PATH : null,
    },
  });

  await db.skill.createMany({
    data: Object.entries(skills).flatMap(([category, names]) =>
      names.map((name, position) => ({ name, category: category as SkillCategory, position })),
    ),
  });

  // Expériences professionnelles
  await db.experience.create({
    data: {
      type: "WORK",
      title: "Développeur Full-Stack Angular / NestJS (alternance)",
      organization: "Synethis (distributeur Renault)",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2026-08-31"),
      description: [
        "- Développement d'applications pour PaddockOne, la plateforme de gestion du groupe : répartition des véhicules entre les concessions, suivi des ventes de véhicules d'occasion.",
        "- Refonte du back-end (Express → NestJS) : modélisation de la nouvelle base PostgreSQL avec le lead développeur et migration des données.",
        "- Conception, en binôme, d'une application de suivi des équipements par QR code : contrôles, réparations et échanges avec les prestataires.",
      ].join("\n"),
      skills: connect("Angular", "NestJS", "TypeScript", "PostgreSQL", "TypeORM"),
    },
  });
  await db.experience.create({
    data: {
      type: "WORK",
      title: "Développeur back-end — Projet SIMGAME",
      organization: "Institut G4 · ESN simulée Agora, pour un client réel : l'association TACT",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
      description:
        "- ERP de gestion événementielle pour un événement de plus de 3 800 participants : planification, coordination des directions, gestion multi-rôles.\n- Modélisation de la base de données (MCD/MLD), développement back-end Laravel / MySQL et revue de code (GitLab CI/CD).",
      skills: connect("PHP", "MySQL", "GitLab CI/CD"),
    },
  });
  await db.experience.create({
    data: {
      type: "WORK",
      title: "Développeur PHP / JavaScript (stage)",
      organization: "Spock Gestion",
      startDate: new Date("2022-01-01"),
      endDate: new Date("2022-02-28"),
      description:
        "Modernisation de plusieurs interfaces avec Twig (Symfony) et diverses librairies (DataTables, Alertify, PHPExcel).",
      skills: connect("PHP", "JavaScript"),
    },
  });
  await db.experience.create({
    data: {
      type: "WORK",
      title: "Développeur web (stage)",
      organization: "Arteuro",
      startDate: new Date("2021-05-01"),
      endDate: new Date("2021-06-30"),
      description:
        "Création d'un site web en autonomie, du cahier des charges au déploiement, avec base de données et interface administrateur.",
    },
  });

  // Formations
  await db.experience.create({
    data: {
      type: "EDUCATION",
      title: "Titre RNCP niveau 7 — Chef de projet Système d'Information",
      organization: "Institut G4",
      location: "Marseille",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2026-08-31"),
      description: "Formation en alternance.",
    },
  });
  await db.experience.create({
    data: {
      type: "EDUCATION",
      title: "BTS Services Informatiques aux Organisations",
      organization: "Lycée Général et Technologique Paul Sabatier",
      location: "Carcassonne",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2022-06-30"),
      description: "Option Solutions Logicielles et Applications Métiers (SLAM).",
    },
  });

  // Projets
  await db.project.create({
    data: {
      slug: "paddockone-applications-metier",
      title: "PaddockOne — applications métier",
      summary:
        "Applications développées pour la plateforme de gestion des 22 sites du groupe Synethis : répartition des véhicules entre concessions, analyse des ventes de véhicules d'occasion.",
      content: [
        "## Contexte",
        "",
        "PaddockOne est la plateforme web interne du groupe Synethis, distributeur Renault. Ce logiciel de gestion centralisé est utilisé par l'ensemble des concessions pour piloter leurs activités : gestion commerciale, relation client, campagnes marketing, formation des collaborateurs et diffusion d'informations internes.",
        "",
        "La plateforme est modulaire : chaque fonctionnalité est une application dédiée, intégrée à l'ensemble. Elle est utilisée par plusieurs centaines de personnes sur 22 sites : chefs des ventes et vendeurs (véhicules neufs et d'occasion), équipes marketing et, au siège, principalement pour l'analyse des tableaux de bord.",
        "",
        "J'y ai travaillé pendant mes trois ans d'alternance. L'outil étant interne, il n'y a ni captures d'écran ni code public.",
        "",
        "## Plan de lancement",
        "",
        "Objectif : optimiser la répartition des véhicules entre les concessions du groupe.",
        "",
        "- Le calcul s'appuie sur les ventes de l'année précédente et sur le stock actuel de chaque concession.",
        "- L'application génère automatiquement une répartition optimale.",
        "- La personne chargée de la répartition peut ensuite l'ajuster, par exemple pour un nouveau modèle ou un besoin supplémentaire connu à l'avance.",
        "- Résultat : un gain de temps important, et une répartition de meilleure qualité.",
        "",
        "## Perf Co VO",
        "",
        "Suivi des commandes de véhicules d'occasion.",
        "",
        "- Import automatique des données de commandes depuis un fichier Excel, chaque nuit, par une tâche planifiée (cron).",
        "- Tableaux et graphiques (ApexCharts), chacun personnalisable par des filtres.",
        "- Tableau de bord avec deux graphiques côte à côte pour comparer deux périodes, par défaut l'année précédente et l'année en cours.",
      ].join("\n"),
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 0,
      skills: connect("Angular", "NestJS", "TypeScript", "PostgreSQL", "TypeORM"),
    },
  });
  await db.project.create({
    data: {
      slug: "paddockone-refonte-back-end",
      title: "Refonte du back-end de PaddockOne",
      summary:
        "Migration d'Express vers NestJS, remodélisation de la base PostgreSQL en schémas par domaine et migration des données de plus d'une centaine de tables.",
      content: [
        "## Contexte",
        "",
        "Le back-end historique de PaddockOne reposait sur Express, avec une base PostgreSQL dont toutes les tables se trouvaient dans un seul schéma (`public`). Vu la taille de la base, l'ensemble devenait difficile à lire et à maintenir.",
        "",
        "## Ce qui a été fait",
        "",
        "- Passage à **NestJS** et **TypeORM**, avec des tests unitaires et d'intégration (Vitest) et des tests end-to-end (Playwright).",
        "- Nouvelle base découpée en **plusieurs schémas PostgreSQL** : des schémas globaux, partagés par toute la plateforme, et des schémas propres à chaque application.",
        "",
        "## Mon rôle",
        "",
        "- **Modélisation** : conception complète de la nouvelle base avec mon lead développeur, sur pgModeler.",
        "- **Migration des données** : transfert des données de l'ancienne base vers la nouvelle structure (détails ci-dessous).",
        "- **Réécriture** de plusieurs fonctionnalités back-end sur NestJS.",
        "",
        "## La migration des données",
        "",
        "Plus d'une centaine de tables à reprendre, avec des scripts TypeScript. Les principaux défis :",
        "",
        "- **Garder les liens entre les données** : les relations devaient rester cohérentes alors que la structure changeait entièrement.",
        "- **Transformer les données** pour les adapter aux nouveaux modèles, et écarter celles qui ne devaient pas être reprises.",
        "- **Le temps d'exécution** : vu le volume, j'ai dû fortement optimiser certains traitements.",
        "",
        "## Résultat",
        "",
        "Une base beaucoup plus claire, où chaque application retrouve ses données dans son propre schéma, et un back-end plus facile à maintenir et à faire évoluer.",
      ].join("\n"),
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 1,
      skills: connect(
        "NestJS",
        "Express",
        "TypeScript",
        "PostgreSQL",
        "TypeORM",
        "pgModeler",
        "Vitest",
        "Playwright",
      ),
    },
  });
  await db.project.create({
    data: {
      slug: "suivi-equipements-qr-code",
      title: "Suivi des équipements par QR code",
      summary:
        "Application mobile de suivi des équipements des garages et concessions (ponts élévateurs, cabines de peinture…) : contrôles, réparations et échanges avec les prestataires.",
      content: [
        "## Contexte",
        "",
        "Dans les garages et concessions du groupe Synethis, de nombreux équipements doivent être contrôlés régulièrement : ponts élévateurs, filtres et systèmes d'aération des cabines de peinture… Le parc compte plusieurs centaines d'équipements.",
        "",
        "Leur suivi reposait sur une base FileMaker, utilisée au quotidien par le responsable logistique depuis 2006, avec un historique de données conséquent.",
        "",
        "## L'application",
        "",
        "Application indépendante de PaddockOne, conçue en binôme avec un autre développeur alternant.",
        "",
        "- Chaque équipement possède un QR code, généré et imprimé depuis l'application.",
        "- En le scannant avec la caméra du téléphone, le personnel du garage accède au suivi de l'équipement.",
        "- Les prestataires chargés des vérifications, comme ceux qui assurent les remplacements et réparations, scannent eux aussi les équipements.",
        "- Des e-mails envoyés depuis l'application coordonnent les intervenants pour organiser le suivi et les réparations, par exemple une demande de maintenance au prestataire.",
        "",
        "## Choix techniques",
        "",
        "- **Front-end Angular** (TypeScript), packagé en application mobile avec **Capacitor** pour utiliser la caméra du téléphone.",
        "- **Back-end FileMaker** : l'application s'appuie sur la base existante, ce qui conserve tout l'historique accumulé depuis 2006.",
      ].join("\n"),
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 2,
      skills: connect("Angular", "TypeScript", "Capacitor", "FileMaker"),
    },
  });
  await db.project.create({
    data: {
      slug: "erp-evenementiel-tact",
      title: "ERP événementiel — association TACT",
      summary:
        "ERP de gestion d'un événement de plus de 3 800 participants, réalisé à 20 dans une ESN simulée pour un client réel.",
      content: [
        "## Contexte",
        "",
        "Projet SIMGAME de l'Institut G4 (2025 – 2026) : une ESN simulée, Agora, réalise un vrai projet pour un client réel, l'association TACT. L'objectif : un ERP de gestion événementielle pour un événement de plus de 3 800 participants, avec planification, coordination des directions et gestion multi-rôles.",
        "",
        "L'équipe comptait 20 personnes, organisées comme dans une vraie ESN : chef de projet, directeur financier, directions MOE et MOA, pôle qualité, équipes MOE et MOA.",
        "",
        "## Mon rôle : développeur back-end",
        "",
        "- **Modélisation** de la base de données (MCD/MLD) : environ 60 tables.",
        "- **Gestion des droits** : tables `role`, `permission` et `role_has_permission`, chaque permission correspondant à une route du back-end.",
        "- **Tickets de support** entre les différentes directions de l'association (les inscriptions des participants passent, elles, par la plateforme Wizevent).",
        "- **Arbres de tournois** : à la création d'un tournoi, tous les matchs sont générés en base à l'avance ; les équipes des tours suivants sont renseignées au fur et à mesure que les matchs précédents se terminent.",
        "- **Revue de code** : à chaque merge request, une pipeline GitLab CI/CD s'exécutait, puis je relisais le code et faisais mes retours en cas de problème.",
        "",
        "Back-end développé en Laravel avec MySQL.",
        "",
        "## Statut",
        "",
        "Application livrée au client en juin 2026, pour un événement prévu en fin d'année.",
      ].join("\n"),
      kind: "ACADEMIC",
      published: true,
      position: 3,
      skills: connect("PHP", "MySQL", "SQL", "GitLab CI/CD"),
    },
  });
  await db.project.create({
    data: {
      slug: "comparateur-hellcase-csfloat",
      title: "Comparateur de prix Hellcase / CSFloat",
      summary:
        "Extension navigateur qui affiche, sur chaque skin Hellcase, son prix CSFloat et l'écart en pourcentage.",
      content: [
        "## Contexte",
        "",
        "Sur Hellcase, le prix de nombreux skins est surévalué de 60 à 70 % par rapport au marché, alors que d'autres restent proches de leur valeur réelle. Retirer un skin surévalué, c'est perdre cet écart pour rien.",
        "",
        "## L'extension",
        "",
        "- Sur chaque carte de skin de Hellcase, elle affiche le prix CSFloat et le pourcentage d'écart avec le prix Hellcase.",
        "- Les prix proviennent de l'API officielle de CSFloat.",
        "- Objectif : repérer en un coup d'œil les skins les plus intéressants à retirer.",
        "",
        "Extension Manifest V3 écrite en TypeScript. Projet personnel, non publié sur un store.",
      ].join("\n"),
      kind: "PERSONAL",
      published: true,
      position: 4,
      skills: connect("TypeScript"),
    },
  });
  await db.project.create({
    data: {
      slug: "brawlhalla-tracker",
      title: "Brawlhalla Tracker",
      summary:
        "Tracker de statistiques Brawlhalla qui analyse les replays directement sur le PC du joueur, depuis le navigateur.",
      content: [
        "## Contexte",
        "",
        "Sur Brawlhalla, les replays des parties sont enregistrés localement, sur le PC du joueur. Un tracker ne peut donc analyser que les parties jouées sur l'ordinateur de l'utilisateur.",
        "",
        "## Fonctionnement",
        "",
        "- L'utilisateur sélectionne, depuis le navigateur, le dossier où le jeu enregistre ses replays.",
        "- L'application lit les fichiers, retrouve automatiquement son identifiant Brawlhalla et le redirige vers son profil.",
        "- Les données viennent de deux sources : les fichiers de replay et l'API de Brawlhalla.",
        "- Statistiques par personnage, classement (Elo), pourcentage de victoires…",
        "",
        "## Choix techniques",
        "",
        "Application React en TypeScript, entièrement dans le navigateur, sans base de données.",
        "",
        "## Statut",
        "",
        "En cours de développement.",
      ].join("\n"),
      kind: "PERSONAL",
      published: true,
      position: 5,
      skills: connect("React", "TypeScript"),
    },
  });
  await db.project.create({
    data: {
      slug: "portfolio",
      title: "Ce portfolio",
      summary:
        "Site full-stack administrable : base PostgreSQL, back-office sécurisé, tests E2E, auto-hébergé.",
      content: [
        "## Contexte",
        "",
        "Le site que vous consultez, conçu comme un vrai projet full-stack : contenu administrable, base de données, authentification, tests et auto-hébergement.",
        "",
        "## Points techniques",
        "",
        "- **Next.js** (App Router) : Server Components, Server Actions, pages pré-rendues et cache invalidé de façon ciblée après chaque modification.",
        "- **PostgreSQL + Prisma** : schéma et migrations versionnés, contraintes vérifiées par la base.",
        "- **Back-office sécurisé** (Better Auth) : gestion des projets et de leurs images, du parcours, des compétences, du CV et des messages.",
        "- **Formulaire de contact** protégé contre le spam : champ piège, limite d'envois par adresse IP.",
        "- **Accessibilité** vérifiée (WCAG AA), thème clair/sombre, animations sans bibliothèque.",
        "- **Tests end-to-end** avec Playwright, déploiement Docker sur un serveur personnel.",
      ].join("\n"),
      kind: "PERSONAL",
      repoUrl: "https://github.com/ioamra/portfolio",
      published: true,
      position: 6,
      skills: connect("Next.js", "TypeScript", "PostgreSQL", "Prisma", "Playwright"),
    },
  });

  console.log(`Seed terminé (CV ${cvAvailable ? "référencé" : "absent du stockage"}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
