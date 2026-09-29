import { z } from "zod";
import { ExperienceType, ProjectKind, SkillCategory } from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Briques communes : les champs HTML arrivent toujours sous forme de chaînes.
// ---------------------------------------------------------------------------

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} est obligatoire.`).max(max, `${max} caractères maximum.`);

/** Texte facultatif : chaîne vide → null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum.`)
    .transform((value) => value || null);

/** URL facultative : chaîne vide → null. */
const optionalUrl = z
  .string()
  .trim()
  .max(255, "255 caractères maximum.")
  .refine((value) => value === "" || z.url().safeParse(value).success, "URL invalide.")
  .transform((value) => value || null);

/** Case à cocher : présente ("on") ou absente du FormData. */
const checkbox = z.preprocess((value) => value === "on", z.boolean());

const position = z.coerce.number().int("Nombre entier attendu.").min(0).max(999);

/** Champ <input type="month"> ("2024-09") → 1er jour du mois, en UTC. */
const month = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Date invalide.")
  .transform((value) => new Date(`${value}-01T00:00:00Z`));

// ---------------------------------------------------------------------------
// Schémas des formulaires admin
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  fullName: requiredText("Le nom", 100),
  headline: requiredText("Le titre", 150),
  bio: requiredText("La présentation", 2000),
  location: optionalText(100),
  availability: optionalText(150),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  /** Une ligne par savoir-faire. */
  strengths: z.string().transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  title: requiredText("Le titre", 100),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est obligatoire.")
    .max(100, "100 caractères maximum.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minuscules, chiffres et tirets uniquement."),
  summary: requiredText("Le résumé", 300),
  content: requiredText("Le contenu", 20000),
  kind: z.enum(ProjectKind, "Type invalide."),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: checkbox,
  published: checkbox,
  position,
  skillIds: z.array(z.string()),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const experienceSchema = z
  .object({
    type: z.enum(ExperienceType, "Type invalide."),
    title: requiredText("L'intitulé", 150),
    organization: optionalText(150),
    location: optionalText(100),
    startDate: month,
    endDate: z.union([z.literal("").transform(() => null), month]),
    description: requiredText("La description", 5000),
    skillIds: z.array(z.string()),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "La fin doit être après le début.",
  });
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const skillSchema = z.object({
  name: requiredText("Le nom", 50),
  category: z.enum(SkillCategory, "Catégorie invalide."),
  position,
});
export type SkillInput = z.infer<typeof skillSchema>;

export const imageAltSchema = z.object({
  alt: requiredText("Le texte alternatif", 200),
});
