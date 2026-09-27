import { DownloadIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { SkillList } from "@/components/skill-list";
import { SkillsByCategory } from "@/components/skills-by-category";
import { ButtonLink } from "@/components/button-link";
import type { ExperienceType } from "@/generated/prisma/enums";
import { formatPeriod } from "@/lib/format";
import { EXPERIENCE_TYPE_LABELS } from "@/lib/labels";
import { listExperiences, type ExperienceWithSkills } from "@/server/services/experience.service";
import { getProfile } from "@/server/services/profile.service";

export const metadata: Metadata = {
  title: "Parcours",
  description: "Expériences professionnelles, formations et compétences.",
};

export default async function CareerPage() {
  const [profile, experiences] = await Promise.all([getProfile(), listExperiences()]);

  const sections: ExperienceType[] = ["WORK", "EDUCATION"];

  return (
    <PageTransition>
      <div className="container-page space-y-16 py-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            as="h1"
            eyebrow="Parcours"
            title="Expériences et formations"
            description="Mon parcours en un coup d'œil."
          />
          {profile.cvPath && (
            <ButtonLink size="lg" href="/cv" download>
              <DownloadIcon data-icon="inline-start" />
              Télécharger mon CV
            </ButtonLink>
          )}
        </div>

        {sections.map((type) => {
          const items = experiences.filter((experience) => experience.type === type);
          if (items.length === 0) return null;
          return (
            <section key={type} className="reveal" aria-labelledby={`section-${type}`}>
              <h2 id={`section-${type}`} className="mb-6 text-xl font-semibold tracking-tight">
                {EXPERIENCE_TYPE_LABELS[type]}
              </h2>
              <Timeline items={items} />
            </section>
          );
        })}

        <section className="reveal" aria-labelledby="section-competences">
          <h2 id="section-competences" className="mb-6 text-xl font-semibold tracking-tight">
            Compétences
          </h2>
          <SkillsByCategory />
        </section>
      </div>
    </PageTransition>
  );
}

function Timeline({ items }: { items: ExperienceWithSkills[] }) {
  return (
    <ol className="relative space-y-8 border-l pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[29px] size-2.5 rounded-full border-2 border-background bg-primary"
          />
          <p className="font-mono text-xs text-muted-foreground">
            {formatPeriod(item.startDate, item.endDate)}
          </p>
          <h3 className="mt-1 font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">
            {item.organization}
            {item.location && ` · ${item.location}`}
          </p>
          <p className="mt-2 max-w-2xl">{item.description}</p>
          <SkillList skills={item.skills} className="mt-3" />
        </li>
      ))}
    </ol>
  );
}
