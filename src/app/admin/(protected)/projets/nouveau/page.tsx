import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createProjectAction } from "@/server/actions/admin/project.action";
import { listSkillsForAdmin } from "@/server/services/skill.service";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Nouveau projet" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function NewProjectPage() {
  const skills = await listSkillsForAdmin();

  return (
    <>
      <AdminPageHeader
        title="Nouveau projet"
        description="Les images s'ajoutent après la création."
      />
      <ProjectForm action={createProjectAction} skills={skills} submitLabel="Créer le projet" />
    </>
  );
}
