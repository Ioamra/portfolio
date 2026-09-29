import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createExperienceAction } from "@/server/actions/admin/experience.action";
import { listSkillsForAdmin } from "@/server/services/skill.service";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Nouvelle entrée du parcours" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function NewExperiencePage() {
  const skills = await listSkillsForAdmin();

  return (
    <>
      <AdminPageHeader title="Nouvelle entrée du parcours" />
      <ExperienceForm action={createExperienceAction} skills={skills} submitLabel="Ajouter" />
    </>
  );
}
