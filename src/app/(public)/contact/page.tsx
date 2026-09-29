import { ClockIcon, MapPinIcon } from "lucide-react";
import type { Metadata } from "next";
import { GithubIcon } from "@/components/icons";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { getProfile } from "@/server/services/profile.service";
import { ContactSection } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Me contacter pour un poste ou un projet.",
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <PageTransition>
      <div className="container-page py-16">
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Me contacter"
          description="Un poste, une question ? Écrivez-moi, je réponds rapidement."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_16rem]">
          <ContactSection />

          <aside aria-label="Autres informations" className="space-y-5 text-sm">
            <p className="flex items-start gap-3 text-muted-foreground">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Réponse sous 48 h ouvrées.
            </p>
            {profile.location && (
              <p className="flex items-start gap-3 text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {profile.location}
              </p>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                Mon GitHub
              </a>
            )}
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
