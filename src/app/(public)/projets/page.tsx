import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { listPublishedProjects } from "@/server/services/project.service";
import { listSkillsUsedInPublishedProjects } from "@/server/services/skill.service";
import { ProjectsExplorer } from "./projects-explorer";

export const metadata: Metadata = {
  title: "Projets",
  description: "Projets professionnels et personnels.",
};

export default async function ProjectsPage() {
  const [projects, skills] = await Promise.all([
    listPublishedProjects(),
    listSkillsUsedInPublishedProjects(),
  ]);

  return (
    <PageTransition>
      <div className="container-page space-y-10 py-16">
        <SectionHeading
          as="h1"
          eyebrow="Projets"
          title="Ce que j'ai construit"
          description="Projets réalisés en entreprise et sur mon temps libre."
        />
        <ProjectsExplorer projects={projects} skills={skills} />
      </div>
    </PageTransition>
  );
}
