import { connection } from "next/server";
import { readStoredFile } from "@/server/storage";
import { contentTypeFor } from "@/server/uploads";

/**
 * Images des projets : GET /media/projects/<id>/<fichier>
 * Seul le dossier projects/ est exposé (le CV passe par /cv).
 */
export async function GET(_request: Request, { params }: RouteContext<"/media/[...path]">) {
  await connection();
  const segments = (await params).path;

  if (segments[0] !== "projects" || segments.some((segment) => segment.startsWith("."))) {
    return new Response("Introuvable.", { status: 404 });
  }

  const relativePath = segments.join("/");
  const file = await readStoredFile(relativePath);
  if (!file) return new Response("Introuvable.", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentTypeFor(relativePath),
      "Content-Length": String(file.length),
      // Noms de fichiers aléatoires et jamais réutilisés : cache long sans risque.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
