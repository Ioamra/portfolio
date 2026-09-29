import { connection } from "next/server";
import { getProfile } from "@/server/services/profile.service";
import { readStoredFile } from "@/server/storage";

/** Nom du fichier téléchargé, ex. « CV_Ioamra_Monchau.pdf » (ASCII, sans accents). */
function downloadName(fullName: string) {
  const ascii = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `CV_${ascii || "portfolio"}.pdf`;
}

/** Téléchargement du CV : GET /cv */
export async function GET() {
  // Lu à chaque requête : le CV peut être remplacé depuis l'admin.
  await connection();

  const profile = await getProfile();
  const file = profile.cvPath ? await readStoredFile(profile.cvPath) : null;
  if (!file) {
    return new Response("CV indisponible.", { status: 404 });
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.length),
      "Content-Disposition": `attachment; filename="${downloadName(profile.fullName)}"`,
      "Cache-Control": "no-cache",
    },
  });
}
