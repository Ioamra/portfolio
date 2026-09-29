import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/button-link";
import { Badge } from "@/components/ui/badge";
import { PROJECT_KIND_LABELS } from "@/lib/labels";
import { listProjectsForAdmin } from "@/server/services/project.service";

export const metadata: Metadata = { title: "Projets" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function AdminProjectsPage() {
  const projects = await listProjectsForAdmin();

  return (
    <>
      <AdminPageHeader
        title="Projets"
        description="Triés par position, comme sur le site."
        actions={
          <ButtonLink href="/admin/projets/nouveau">
            <PlusIcon data-icon="inline-start" />
            Nouveau projet
          </ButtonLink>
        }
      />
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun projet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th scope="col" className="p-3 font-medium">
                  Pos.
                </th>
                <th scope="col" className="p-3 font-medium">
                  Projet
                </th>
                <th scope="col" className="p-3 font-medium">
                  Type
                </th>
                <th scope="col" className="p-3 font-medium">
                  État
                </th>
                <th scope="col" className="p-3 font-medium">
                  Images
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="p-3 font-mono text-muted-foreground">{project.position}</td>
                  <td className="p-3">
                    <Link
                      href={`/admin/projets/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {project.skills.map((skill) => skill.name).join(", ")}
                    </p>
                  </td>
                  <td className="p-3">{PROJECT_KIND_LABELS[project.kind]}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={project.published ? "default" : "outline"}>
                        {project.published ? "Publié" : "Brouillon"}
                      </Badge>
                      {project.featured && <Badge variant="secondary">À la une</Badge>}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{project._count.images}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
