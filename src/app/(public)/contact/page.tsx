import { MapPinIcon } from "lucide-react";
import type { Metadata } from "next";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { getProfile } from "@/server/services/profile.service";
import { ContactSection } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Me contacter pour un poste ou un projet.",
  alternates: { canonical: "/contact" },
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
          description="Un poste, une question ? Écrivez-moi."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_16rem]">
          <ContactSection />

          <aside aria-label="Autres informations" className="space-y-5 text-sm">
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
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                <LinkedinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                Mon LinkedIn
              </a>
            )}
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
