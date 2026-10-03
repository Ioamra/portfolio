import type { MetadataRoute } from "next";
import { env } from "@/server/env";
import { listPublishedProjectsForSitemap } from "@/server/services/project.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, env.SITE_URL).toString();
  const projects = await listPublishedProjectsForSitemap();

  return [
    { url: url("/"), priority: 1 },
    { url: url("/projets"), priority: 0.9 },
    { url: url("/parcours"), priority: 0.8 },
    { url: url("/contact"), priority: 0.6 },
    { url: url("/mentions-legales"), priority: 0.1 },
    ...projects.map((project) => ({
      url: url(`/projets/${project.slug}`),
      lastModified: project.updatedAt,
      priority: 0.7,
    })),
  ];
}
