import { z } from "zod";

/** Nom du champ piège : invisible pour un humain, rempli par les robots. */
export const HONEYPOT_FIELD = "website";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom (2 caractères minimum).")
    .max(100, "100 caractères maximum."),
  email: z.email("Adresse e-mail invalide.").trim().max(254, "Adresse e-mail trop longue."),
  subject: z
    .string()
    .trim()
    .min(3, "Indiquez un sujet (3 caractères minimum).")
    .max(150, "150 caractères maximum."),
  message: z
    .string()
    .trim()
    .min(20, "Votre message est un peu court (20 caractères minimum).")
    .max(5000, "5000 caractères maximum."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;
