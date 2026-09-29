import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { SkillList } from "@/components/skill-list";
import { TiltCard } from "@/components/tilt-card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_KIND_LABELS } from "@/lib/labels";
import { mediaUrl } from "@/lib/media";
import type { ProjectCard as ProjectCardData } from "@/server/services/project.service";

export function projectTitleTransitionName(slug: string) {
  return `project-title-${slug}`;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const cover = project.images[0];

  return (
    <TiltCard className="h-full rounded-xl" maxTilt={5}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50">
        {cover && (
          // Images servies par la route /media (stockage local) : balise img simple, sans next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(cover.path)}
            alt={cover.alt}
            className="aspect-video w-full border-b object-cover"
          />
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold tracking-tight">
              {/* Le lien couvre toute la carte via le pseudo-élément ::after. */}
              <Link href={`/projets/${project.slug}`} className="after:absolute after:inset-0">
                {/* Le titre « voyage » de la carte vers la page détail lors de la navigation. */}
                <ViewTransition
                  name={projectTitleTransitionName(project.slug)}
                  share="morph"
                  default="none"
                >
                  <span className="inline-block">{project.title}</span>
                </ViewTransition>
              </Link>
            </h3>
            <ArrowUpRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            />
          </div>
          <Badge variant="outline" className="w-fit">
            {PROJECT_KIND_LABELS[project.kind]}
          </Badge>
          <p className="flex-1 text-sm text-muted-foreground">{project.summary}</p>
          <SkillList skills={project.skills} />
        </div>
      </article>
    </TiltCard>
  );
}
