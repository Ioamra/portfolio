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
  FRONTEND: ["Angular", "React", "Next.js"],
  BACKEND: ["NestJS", "Express"],
  DATABASE: ["PostgreSQL", "MySQL", "pgModeler", "Prisma"],
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
        "- Développement de l'ERP de l'entreprise : applications métier pour les différents services (répartition des stocks, analyses statistiques…).",
        "- Conception d'une application de suivi du matériel par QR code : génération et impression des QR codes, scan des équipements, suivi et déclenchement d'actions (ex. demande de maintenance auprès du prestataire).",
      ].join("\n"),
      skills: connect("Angular", "NestJS", "TypeScript", "PostgreSQL"),
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
      slug: "erp-synethis",
      title: "ERP métier — Synethis",
      summary:
        "Applications métier de l'ERP d'un distributeur Renault : répartition des stocks, analyses statistiques…",
      content: [
        "## Contexte",
        "",
        "Trois ans d'alternance chez Synethis, distributeur Renault, sur l'ERP interne de l'entreprise. Projet professionnel : le code n'est pas public.",
        "",
        "## Réalisations",
        "",
        "- Développement d'applications métier pour les différents services : répartition des stocks, analyses statistiques…",
        "- Travail sur toute la chaîne : interfaces Angular, API NestJS, base de données.",
      ].join("\n"),
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 0,
      skills: connect("Angular", "NestJS", "TypeScript", "PostgreSQL"),
    },
  });
  await db.project.create({
    data: {
      slug: "suivi-materiel-qr-code",
      title: "Suivi du matériel par QR code",
      summary:
        "Génération et impression de QR codes, scan des équipements, suivi et déclenchement d'actions comme une demande de maintenance.",
      content: [
        "## Contexte",
        "",
        "Application conçue pendant mon alternance chez Synethis pour suivre le matériel de l'entreprise.",
        "",
        "## Fonctionnalités",
        "",
        "- Génération et impression des QR codes des équipements.",
        "- Scan des équipements pour consulter et mettre à jour leur suivi.",
        "- Déclenchement d'actions, par exemple une demande de maintenance auprès du prestataire.",
      ].join("\n"),
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 1,
      skills: connect("Angular", "NestJS", "TypeScript"),
    },
  });
  await db.project.create({
    data: {
      slug: "erp-evenementiel-tact",
      title: "ERP événementiel — association TACT",
      summary:
        "ERP de gestion d'un événement de plus de 3 800 participants, réalisé en ESN simulée pour un client réel.",
      content: [
        "## Contexte",
        "",
        "Projet SIMGAME de l'Institut G4 : une ESN simulée (Agora) réalise un projet pour un client réel, l'association TACT.",
        "",
        "## Mon rôle : développeur back-end",
        "",
        "- Modélisation de la base de données (MCD/MLD).",
        "- Développement back-end Laravel / MySQL : planification, coordination des directions, gestion multi-rôles.",
        "- Revue de code et intégration continue avec GitLab CI/CD.",
      ].join("\n"),
      kind: "ACADEMIC",
      featured: true,
      published: true,
      position: 2,
      skills: connect("PHP", "MySQL", "GitLab CI/CD"),
    },
  });
  await db.project.create({
    data: {
      slug: "portfolio",
      title: "Ce portfolio",
      summary: "Site full-stack avec back-office, base PostgreSQL et tests E2E, auto-hébergé.",
      content: [
        "## Contexte",
        "",
        "Le site que vous consultez : un portfolio administrable, conçu comme un vrai projet full-stack.",
        "",
        "## Stack",
        "",
        "- Next.js (App Router, Server Components, Server Actions) et TypeScript.",
        "- PostgreSQL avec Prisma : schéma et migrations versionnés.",
        "- Tests end-to-end avec Playwright, déploiement Docker sur un serveur personnel.",
      ].join("\n"),
      kind: "PERSONAL",
      published: true,
      position: 3,
      skills: connect("Next.js", "TypeScript", "PostgreSQL", "Prisma", "Playwright"),
    },
  });
  await db.project.create({
    data: {
      slug: "comparateur-skins",
      title: "Comparateur de prix de skins",
      summary: "Extension navigateur comparant les prix des skins entre Hellcase et CSFloat.",
      content:
        "## Contexte\n\nExtension de navigateur qui compare les prix des skins entre Hellcase et CSFloat.",
      kind: "PERSONAL",
      published: true,
      position: 4,
      skills: connect("TypeScript", "JavaScript"),
    },
  });
  await db.project.create({
    data: {
      slug: "tracker-statistiques",
      title: "Tracker de statistiques",
      summary: "Suivi et visualisation de statistiques de jeu.",
      content:
        "## Contexte\n\nOutil personnel de suivi et de visualisation de statistiques de jeu.",
      kind: "PERSONAL",
      published: true,
      position: 5,
      skills: connect("TypeScript"),
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
