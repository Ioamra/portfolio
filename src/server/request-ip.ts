import "server-only";
import { headers } from "next/headers";

/**
 * Adresse IP du visiteur, pour les limites d'envoi et de connexion.
 * cf-connecting-ip est posé par Cloudflare (Tunnel) ; les autres pour un proxy classique.
 */
export async function getClientIp() {
  const headerList = await headers();
  return (
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
