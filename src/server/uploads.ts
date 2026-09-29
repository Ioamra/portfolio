import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveStoragePath } from "./storage";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
type ImageExtension = keyof typeof IMAGE_TYPES;

/** Type MIME servi pour une extension du stockage (route /media). */
export function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).slice(1) as ImageExtension;
  return IMAGE_TYPES[extension] ?? "application/octet-stream";
}

/**
 * Identifie le format d'une image par ses premiers octets (« magic numbers ») :
 * le type MIME et l'extension envoyés par le navigateur ne sont pas fiables.
 */
function detectImage(bytes: Uint8Array): ImageExtension | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  // RIFF....WEBP
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return "webp";
  }
  return null;
}

function isPdf(bytes: Uint8Array) {
  return [0x25, 0x50, 0x44, 0x46, 0x2d].every((byte, i) => bytes[i] === byte); // %PDF-
}

type UploadResult = { ok: true; path: string } | { ok: false; error: string };

async function readUpload(file: File): Promise<{ error: string } | { bytes: Uint8Array }> {
  if (file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Fichier trop lourd (5 Mo maximum)." };
  return { bytes: new Uint8Array(await file.arrayBuffer()) };
}

async function store(relativePath: string, bytes: Uint8Array) {
  const absolutePath = resolveStoragePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
}

/** Enregistre une image de projet sous un nom aléatoire : projects/<id>/<uuid>.<ext> */
export async function saveProjectImage(projectId: string, file: File): Promise<UploadResult> {
  const upload = await readUpload(file);
  if ("error" in upload) return { ok: false, error: upload.error };

  const extension = detectImage(upload.bytes);
  if (!extension) return { ok: false, error: "Format non pris en charge (JPEG, PNG ou WebP)." };

  const relativePath = `projects/${projectId}/${randomUUID()}.${extension}`;
  await store(relativePath, upload.bytes);
  return { ok: true, path: relativePath };
}

/** Enregistre le CV (remplace le précédent). */
export async function saveCv(file: File): Promise<UploadResult> {
  const upload = await readUpload(file);
  if ("error" in upload) return { ok: false, error: upload.error };
  if (!isPdf(upload.bytes)) return { ok: false, error: "Le CV doit être un fichier PDF." };

  const relativePath = "cv/cv.pdf";
  await store(relativePath, upload.bytes);
  return { ok: true, path: relativePath };
}

/** Supprime un fichier ou un dossier du stockage (sans erreur s'il n'existe pas). */
export async function deleteStored(relativePath: string) {
  await rm(resolveStoragePath(relativePath), { recursive: true, force: true });
}
