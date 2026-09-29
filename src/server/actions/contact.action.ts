"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  contactSchema,
  HONEYPOT_FIELD,
  type ContactField,
  type ContactInput,
} from "@/lib/validation/contact";
import { createRateLimiter } from "../rate-limit";
import { submitContactMessage } from "../services/contact.service";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
      /** Valeurs saisies, renvoyées pour que le formulaire ne se vide pas en cas d'erreur. */
      values?: Partial<ContactInput>;
    };

// 3 messages par tranche de 10 minutes et par adresse IP.
const limiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

async function getClientIp() {
  const headerList = await headers();
  // cf-connecting-ip est posé par Cloudflare (Tunnel) ; les autres pour un proxy classique.
  return (
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Champ piège rempli : c'est un robot. On simule un succès sans rien enregistrer.
  if (formData.get(HONEYPOT_FIELD)) {
    return { status: "success" };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const result = contactSchema.safeParse(values);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      status: "error",
      message: "Certains champs sont invalides.",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
      ),
      values,
    };
  }

  if (!limiter.consume(await getClientIp())) {
    return {
      status: "error",
      message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
      values,
    };
  }

  try {
    await submitContactMessage(result.data);
  } catch (error) {
    console.error("Échec de l'enregistrement du message de contact", error);
    return {
      status: "error",
      message: "Une erreur est survenue. Réessayez plus tard.",
      values,
    };
  }

  return { status: "success" };
}
