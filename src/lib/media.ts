/** URL publique d'un fichier du stockage (voir app/media/[...path]/route.ts). */
export function mediaUrl(storagePath: string) {
  return `/media/${storagePath}`;
}
