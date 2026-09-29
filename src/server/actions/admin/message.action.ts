"use server";

import { refresh } from "next/cache";
import { requireAdminAction } from "../../auth-guard";
import { deleteContactMessage, setMessageRead } from "../../services/contact.service";

// Les messages ne sont affichés que dans l'admin (jamais mis en cache) :
// refresh() suffit pour réafficher la page à jour.

export async function setMessageReadAction(messageId: string, read: boolean) {
  await requireAdminAction();

  await setMessageRead(messageId, read);
  refresh();
}

export async function deleteMessageAction(messageId: string) {
  await requireAdminAction();

  await deleteContactMessage(messageId);
  refresh();
}
