import "server-only";
import { z } from "zod";

/**
 * Variables d'environnement serveur, validées au démarrage.
 * Une variable manquante ou invalide fait échouer l'application immédiatement
 * plutôt qu'au premier usage.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  // Vides en dev (Mailpit n'exige pas d'authentification).
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  /** Expéditeur des mails, ex. "Portfolio <no-reply@mondomaine.fr>". */
  MAIL_FROM: z.string().min(1),
  /** Adresse qui reçoit les messages du formulaire de contact. */
  MAIL_TO: z.email(),

  /** Dossier des fichiers uploadés (CV, images), hors du dépôt Git. */
  STORAGE_DIR: z.string().min(1).default("storage"),
});

export const env = envSchema.parse(process.env);
