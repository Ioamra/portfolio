import "server-only";

/**
 * Limiteur à fenêtre glissante, en mémoire.
 * Suffisant pour une seule instance de l'application (auto-hébergement) ; avec plusieurs
 * instances, il faudrait un stockage partagé (Redis, base de données).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return {
    /** Enregistre une tentative. Renvoie false si la limite est dépassée. */
    consume(key: string, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);

      // Nettoyage occasionnel des clés expirées pour que la Map ne grossisse pas indéfiniment.
      if (hits.size > 1000) {
        for (const [otherKey, times] of hits) {
          if (times.every((time) => now - time >= windowMs)) hits.delete(otherKey);
        }
      }
      return true;
    },
  };
}
