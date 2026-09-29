import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

const storageRoot = path.resolve(env.STORAGE_DIR);

/**
 * Résout un chemin relatif du stockage (ex. "cv/cv.pdf") en chemin absolu.
 * Refuse tout chemin qui sortirait du dossier de stockage (ex. "../.env").
 */
export function resolveStoragePath(relativePath: string) {
  const absolutePath = path.resolve(storageRoot, relativePath);
  if (absolutePath !== storageRoot && !absolutePath.startsWith(storageRoot + path.sep)) {
    throw new Error(`Chemin hors du stockage : ${relativePath}`);
  }
  return absolutePath;
}

/** Lit un fichier du stockage. Renvoie null s'il n'existe pas. */
export async function readStoredFile(relativePath: string) {
  try {
    return await readFile(resolveStoragePath(relativePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
