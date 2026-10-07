import { env } from "@/server/env";

/**
 * Script de mesure d'audience Umami (auto-hébergé, sans cookie).
 * Rendu seulement si UMAMI_SCRIPT_URL et UMAMI_WEBSITE_ID sont définis, et limité au
 * domaine du site (data-domains) : les visites en local ne sont pas comptées.
 */
export function Analytics() {
  if (!env.UMAMI_SCRIPT_URL || !env.UMAMI_WEBSITE_ID) return null;

  return (
    <script
      defer
      src={env.UMAMI_SCRIPT_URL}
      data-website-id={env.UMAMI_WEBSITE_ID}
      data-domains={new URL(env.SITE_URL).hostname}
    />
  );
}

export const analyticsEnabled = Boolean(env.UMAMI_SCRIPT_URL && env.UMAMI_WEBSITE_ID);
