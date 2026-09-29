import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { ConflictError, isNotFound } from "./errors";

/**
 * Traduit une erreur levée par un service en état de formulaire.
 * Les erreurs internes de Next (redirect, notFound) sont relancées telles quelles.
 */
export function toErrorState(error: unknown): FormState {
  unstable_rethrow(error);

  if (error instanceof ConflictError) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: { [error.field]: error.message },
    };
  }
  if (isNotFound(error)) {
    return { status: "error", message: "Cet élément n'existe plus." };
  }
  console.error(error);
  return { status: "error", message: "Une erreur est survenue. Réessayez." };
}

/** Récupère un fichier envoyé par un champ <input type="file">. */
export function getUploadedFile(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}
