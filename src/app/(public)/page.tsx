import { ArrowRightIcon, DownloadIcon, MailIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ParticleName } from "@/components/home/particle-name";
import { PageTransition } from "@/components/page-transition";
import { PersonJsonLd } from "@/components/person-json-ld";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { SkillsByCategory } from "@/components/skills-by-category";
import { TiltCard } from "@/components/tilt-card";
import { ButtonLink } from "@/components/button-link";
import { getProfile } from "@/server/services/profile.service";
import { listFeaturedProjects } from "@/server/services/project.service";
import { listSkills } from "@/server/services/skill.service";

// URL canonique définie par page : placée dans un layout, elle serait héritée partout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [profile, featuredProjects, skills] = await Promise.all([
    getProfile(),
    listFeaturedProjects(),
    listSkills(),
  ]);

  return (
    <PageTransition>
      <PersonJsonLd profile={profile} skills={skills.map((skill) => skill.name)} />
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid" />
        <div className="container-page pt-14 pb-16 sm:pt-20 sm:pb-24">
          {profile.availability && (
            <p className="inline-flex animate-in items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {profile.availability}
            </p>
          )}

          <ParticleName text={profile.fullName} className="mt-8" />

          {/* L'animation d'entrée est sur un conteneur séparé : elle modifie transform,
              qui est aussi utilisé par l'inclinaison de la carte. */}
          <div className="mx-auto mt-8 max-w-3xl animate-in delay-300 duration-700 fill-mode-both fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
            <TiltCard className="rounded-2xl" maxTilt={4}>
              {/* Pas de backdrop-blur ici : un filtre aplatirait l'effet de relief 3D. */}
              <div className="space-y-4 rounded-2xl border bg-card/90 p-6 [transform-style:preserve-3d] sm:p-8">
                <p className="[transform:translateZ(35px)] text-xl font-medium tracking-tight sm:text-2xl">
                  {profile.headline}
                </p>
                <p className="[transform:translateZ(25px)] text-muted-foreground sm:text-lg">
                  {profile.bio}
                </p>
                <div className="flex [transform:translateZ(45px)] flex-wrap gap-3 pt-2">
                  <ButtonLink size="lg" href="/projets">
                    Voir mes projets
                    <ArrowRightIcon data-icon="inline-end" />
                  </ButtonLink>
                  <ButtonLink size="lg" variant="outline" href="/contact">
                    <MailIcon data-icon="inline-start" />
                    Me contacter
                  </ButtonLink>
                  {profile.cvPath && (
                    <ButtonLink size="lg" variant="ghost" href="/cv" download>
                      <DownloadIcon data-icon="inline-start" />
                      Télécharger mon CV
                    </ButtonLink>
                  )}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="reveal container-page py-12" aria-labelledby="projets-titre">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading id="projets-titre" eyebrow="Projets" title="Projets à la une" />
            <Link
              href="/projets"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Tous les projets →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      <section className="reveal container-page py-12" aria-labelledby="stack-titre">
        <SectionHeading id="stack-titre" eyebrow="Compétences" title="Ma stack" className="mb-8" />
        <SkillsByCategory />
      </section>

      <section className="reveal container-page py-16">
        <div className="relative isolate overflow-hidden rounded-2xl border bg-muted/40 p-8 text-center sm:p-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid" />
          <h2 className="text-2xl font-semibold tracking-tight">Un poste à pourvoir ?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Je recherche un CDI de développeur. Parlons-en.
          </p>
          <ButtonLink className="mt-6" size="lg" href="/contact">
            Me contacter
          </ButtonLink>
        </div>
      </section>
    </PageTransition>
  );
}
