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
});

export const env = envSchema.parse(process.env);
