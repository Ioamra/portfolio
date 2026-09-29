import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export const LOGIN_PATH = "/admin/connexion";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Pages admin : renvoie l'utilisateur connecté ou redirige vers la connexion.
 * À appeler dans un composant placé sous un <Suspense> (lecture de la requête).
 */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

/**
 * Server Actions admin : à appeler en première ligne de chaque action.
 * Une action est un point d'entrée HTTP public : elle doit vérifier la session
 * elle-même, même si le formulaire n'est affiché qu'aux admins.
 */
export async function requireAdminAction() {
  const session = await getSession();
  if (!session) throw new Error("Non autorisé.");
  return session.user;
}
