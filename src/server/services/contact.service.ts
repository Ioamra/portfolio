import "server-only";
import type { ContactInput } from "@/lib/validation/contact";
import { db } from "../db";
import { sendContactNotification } from "../mail";

/**
 * Enregistre le message puis l'envoie par mail.
 * Le message est d'abord sauvegardé : si l'envoi du mail échoue (SMTP indisponible…),
 * rien n'est perdu, il reste consultable dans l'admin.
 */
export async function submitContactMessage(input: ContactInput) {
  const message = await db.contactMessage.create({ data: input });

  try {
    await sendContactNotification(input);
  } catch (error) {
    console.error(`Échec de l'envoi du mail pour le message ${message.id}`, error);
  }

  return message;
}

// --- Admin -----------------------------------------------------------------

export function listContactMessages() {
  return db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export function setMessageRead(id: string, read: boolean) {
  return db.contactMessage.update({ where: { id }, data: { readAt: read ? new Date() : null } });
}

export function deleteContactMessage(id: string) {
  return db.contactMessage.delete({ where: { id } });
}
