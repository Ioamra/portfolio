import "server-only";
import { z } from "zod";

/**
 * Variables d'environnement serveur, validées au démarrage.
 * Une variable manquante ou invalide fait échouer l'application immédiatement
 * plutôt qu'au premier usage.
 */
/** Variable facultative : une valeur vide (VAR="") compte comme absente. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  // Vides en dev (Mailpit n'exige pas d'authentification).
  SMTP_USER: optional(z.string()),
  SMTP_PASSWORD: optional(z.string()),
  /** Expéditeur des mails, ex. "Portfolio <no-reply@mondomaine.fr>". */
  MAIL_FROM: z.string().min(1),
  /** Adresse qui reçoit les messages du formulaire de contact. */
  MAIL_TO: z.email(),

  /** Dossier des fichiers uploadés (CV, images), hors du dépôt Git. */
  STORAGE_DIR: z.string().min(1).default("storage"),

  /** Secret de chiffrement des sessions (32 caractères minimum). */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** URL publique du site, ex. https://ioamra-monchau.fr (SEO, sitemap, authentification). */
  SITE_URL: z.url(),

  /** Statistiques de visite (Umami), facultatives : script chargé seulement si les deux sont définis. */
  UMAMI_SCRIPT_URL: optional(z.url()),
  UMAMI_WEBSITE_ID: optional(z.string()),
});

export const env = envSchema.parse(process.env);
