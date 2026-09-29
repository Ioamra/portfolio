import "server-only";
import { Prisma } from "@/generated/prisma/client";

/** Valeur déjà utilisée (contrainte d'unicité), rattachée à un champ du formulaire. */
export class ConflictError extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Violation de contrainte d'unicité PostgreSQL remontée par Prisma. */
export function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Enregistrement introuvable (update/delete sur un id inexistant). */
export function isNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
