"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";
import type { ProjectCard as ProjectCardData } from "@/server/services/project.service";

type ProjectsExplorerProps = {
  projects: ProjectCardData[];
  skills: { id: string; name: string }[];
};

/** Liste de projets filtrable par technologie (filtrage côté client : la liste est courte). */
export function ProjectsExplorer({ projects, skills }: ProjectsExplorerProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const visibleProjects = selectedSkillId
    ? projects.filter((project) => project.skills.some((skill) => skill.id === selectedSkillId))
    : projects;

  const filters = [{ id: null, name: "Tous" }, ...skills];

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Filtrer par technologie" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.id === selectedSkillId;
          return (
            <button
              key={filter.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedSkillId(filter.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {filter.name}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visibleProjects.length} projet{visibleProjects.length > 1 ? "s" : ""} affiché
        {visibleProjects.length > 1 ? "s" : ""}
      </p>

      {visibleProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Aucun projet pour cette technologie.</p>
      )}
    </div>
  );
}
