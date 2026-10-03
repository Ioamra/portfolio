import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GithubIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { ProjectGallery } from "@/components/project-gallery";
import { SkillList } from "@/components/skill-list";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/button-link";
import { projectTitleTransitionName } from "@/components/project-card";
import { ViewTransition } from "react";
import { PROJECT_KIND_LABELS } from "@/lib/labels";
import { mediaUrl } from "@/lib/media";
import {
  getPublishedProjectBySlug,
  listPublishedProjectSlugs,
} from "@/server/services/project.service";

export async function generateStaticParams() {
  const slugs = await listPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const url = `/projets/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", title: project.title, description: project.summary, url },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  return (
    <PageTransition>
      <article className="container-page max-w-3xl py-16">
        <Link
          href="/projets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Tous les projets
        </Link>

        <header className="mt-8 space-y-4">
          <Badge variant="outline">{PROJECT_KIND_LABELS[project.kind]}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <ViewTransition
              name={projectTitleTransitionName(project.slug)}
              share="morph"
              default="none"
            >
              <span className="inline-block">{project.title}</span>
            </ViewTransition>
          </h1>
          <p className="text-lg text-muted-foreground">{project.summary}</p>
          <SkillList skills={project.skills} />
          {(project.repoUrl || project.demoUrl) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {project.repoUrl && (
                <ButtonLink
                  variant="outline"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon data-icon="inline-start" />
                  Code source
                </ButtonLink>
              )}
              {project.demoUrl && (
                <ButtonLink href={project.demoUrl} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon data-icon="inline-start" />
                  Voir la démo
                </ButtonLink>
              )}
            </div>
          )}
        </header>

        {project.images.length > 0 && (
          <div className="mt-10">
            <ProjectGallery
              images={project.images.map((image) => ({
                id: image.id,
                src: mediaUrl(image.path),
                alt: image.alt,
              }))}
            />
          </div>
        )}

        <Markdown className="mt-10">{project.content}</Markdown>
      </article>
    </PageTransition>
  );
}
