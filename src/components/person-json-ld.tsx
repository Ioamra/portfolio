import type { Profile } from "@/generated/prisma/client";
import { env } from "@/server/env";

type PersonJsonLdProps = {
  profile: Profile;
  skills: string[];
};

/**
 * Données structurées schema.org « Person » : aident les moteurs de recherche à
 * relier le site, le nom, le métier et les profils GitHub / LinkedIn.
 */
export function PersonJsonLd({ profile, skills }: PersonJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.headline,
    description: profile.bio,
    url: env.SITE_URL,
    sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
    knowsAbout: skills,
    ...(profile.location && {
      address: { "@type": "PostalAddress", addressRegion: profile.location, addressCountry: "FR" },
    }),
  };

  return (
    <script
      type="application/ld+json"
      // « < » échappé : un contenu contenant </script> ne peut pas sortir de la balise.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
