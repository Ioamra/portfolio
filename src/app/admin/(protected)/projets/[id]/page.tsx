import { ExternalLinkIcon, Trash2Icon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ButtonLink } from "@/components/button-link";
import { deleteProjectAction, updateProjectAction } from "@/server/actions/admin/project.action";
import { getProjectForAdmin } from "@/server/services/project.service";
import { listSkillsForAdmin } from "@/server/services/skill.service";
import { ProjectForm } from "../project-form";
import { ProjectImages } from "./project-images";

export const metadata: Metadata = { title: "Modifier le projet" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function EditProjectPage({ params }: PageProps<"/admin/projets/[id]">) {
  const { id } = await params;
  const [project, skills] = await Promise.all([getProjectForAdmin(id), listSkillsForAdmin()]);
  if (!project) notFound();

  return (
    <>
      <AdminPageHeader
        title={project.title}
        actions={
          <>
            {project.published && (
              <ButtonLink variant="outline" href={`/projets/${project.slug}`} target="_blank">
                <ExternalLinkIcon data-icon="inline-start" />
                Voir
              </ButtonLink>
            )}
            <ConfirmActionButton
              action={deleteProjectAction.bind(null, project.id)}
              confirmMessage={`Supprimer « ${project.title} » et ses images ?`}
              variant="destructive"
            >
              <Trash2Icon data-icon="inline-start" />
              Supprimer
            </ConfirmActionButton>
          </>
        }
      />
      <div className="space-y-12">
        <ProjectForm
          action={updateProjectAction.bind(null, project.id)}
          project={project}
          skills={skills}
          submitLabel="Enregistrer"
        />
        <ProjectImages projectId={project.id} images={project.images} />
      </div>
    </>
  );
}
