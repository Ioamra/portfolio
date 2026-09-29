import { Trash2Icon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import {
  deleteExperienceAction,
  updateExperienceAction,
} from "@/server/actions/admin/experience.action";
import { getExperienceForAdmin } from "@/server/services/experience.service";
import { listSkillsForAdmin } from "@/server/services/skill.service";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Modifier le parcours" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function EditExperiencePage({ params }: PageProps<"/admin/parcours/[id]">) {
  const { id } = await params;
  const [experience, skills] = await Promise.all([getExperienceForAdmin(id), listSkillsForAdmin()]);
  if (!experience) notFound();

  return (
    <>
      <AdminPageHeader
        title={experience.title}
        actions={
          <ConfirmActionButton
            action={deleteExperienceAction.bind(null, experience.id)}
            confirmMessage={`Supprimer « ${experience.title} » ?`}
            variant="destructive"
          >
            <Trash2Icon data-icon="inline-start" />
            Supprimer
          </ConfirmActionButton>
        }
      />
      <ExperienceForm
        action={updateExperienceAction.bind(null, experience.id)}
        experience={experience}
        skills={skills}
        submitLabel="Enregistrer"
      />
    </>
  );
}
