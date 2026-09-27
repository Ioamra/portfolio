/**
 * Données de démonstration (textes provisoires à remplacer via l'admin).
 * Idempotent : vide les tables de contenu puis les remplit à nouveau.
 * Lancement : npm run db:seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type SkillCategory } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const skills: Record<SkillCategory, string[]> = {
  BACKEND: ["NestJS", "Node.js", "TypeScript", "API REST"],
  FRONTEND: ["Angular", "Next.js", "React", "SCSS", "Tailwind CSS"],
  DATABASE: ["PostgreSQL", "Modélisation (MCD/MLD)", "TypeORM", "Prisma"],
  DEVOPS: ["Docker", "Git", "CI/CD", "Linux"],
  TOOLS: ["Playwright", "Jest"],
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
      fullName: "Prénom Nom",
      headline: "Développeur web full-stack, orienté back-end",
      bio: "Diplômé d'un titre RNCP niveau 7 de chef de projet SI après trois ans d'alternance comme développeur sur un ERP (Angular / NestJS). J'aime particulièrement la conception d'API et la modélisation de bases de données.",
      location: "France",
      availability: "Disponible immédiatement pour un CDI",
      githubUrl: "https://github.com/",
    },
  });

  await db.skill.createMany({
    data: Object.entries(skills).flatMap(([category, names]) =>
      names.map((name, position) => ({ name, category: category as SkillCategory, position })),
    ),
  });

  await db.experience.create({
    data: {
      type: "WORK",
      title: "Développeur full-stack (alternance)",
      organization: "Entreprise",
      location: "France",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2026-08-31"),
      description:
        "Développement d'un ERP : conception de modules métier, API NestJS, interfaces Angular, modélisation de la base PostgreSQL.",
      skills: connect("Angular", "NestJS", "TypeScript", "PostgreSQL", "TypeORM"),
    },
  });
  await db.experience.create({
    data: {
      type: "EDUCATION",
      title: "Titre RNCP niveau 7 — Chef de projet SI",
      organization: "École",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2026-08-31"),
      description: "Formation en alternance : gestion de projet, architecture SI, développement.",
    },
  });
  await db.experience.create({
    data: {
      type: "EDUCATION",
      title: "BTS SIO option SLAM",
      organization: "Lycée",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2023-07-01"),
      description: "Solutions logicielles et applications métiers.",
    },
  });

  await db.project.create({
    data: {
      slug: "erp-alternance",
      title: "ERP métier",
      summary:
        "Trois ans de développement sur un ERP en production : modules métier, API et modélisation de données.",
      content:
        "## Contexte\n\nProjet professionnel réalisé en alternance (code non public).\n\n## Mon rôle\n\nÀ compléter.\n\n## Ce que j'ai appris\n\nÀ compléter.",
      kind: "PROFESSIONAL",
      featured: true,
      published: true,
      position: 0,
      skills: connect("Angular", "NestJS", "PostgreSQL", "TypeORM"),
    },
  });
  await db.project.create({
    data: {
      slug: "portfolio",
      title: "Ce portfolio",
      summary: "Site full-stack avec back-office, API et tests E2E, auto-hébergé.",
      content: "## Contexte\n\nÀ compléter.",
      kind: "PERSONAL",
      repoUrl: "https://github.com/",
      featured: true,
      published: true,
      position: 1,
      skills: connect("Next.js", "TypeScript", "PostgreSQL", "Prisma", "Docker", "Playwright"),
    },
  });
  await db.project.create({
    data: {
      slug: "comparateur-skins",
      title: "Comparateur de prix de skins",
      summary: "Extension navigateur comparant les prix de Hellcase et CSFloat en temps réel.",
      content: "## Contexte\n\nÀ compléter.",
      kind: "PERSONAL",
      featured: true,
      published: true,
      position: 2,
      skills: connect("TypeScript"),
    },
  });
  await db.project.create({
    data: {
      slug: "tracker-statistiques",
      title: "Tracker de statistiques",
      summary: "Suivi et visualisation de statistiques de jeu.",
      content: "## Contexte\n\nÀ compléter.",
      kind: "PERSONAL",
      published: true,
      position: 3,
      skills: connect("TypeScript"),
    },
  });

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
