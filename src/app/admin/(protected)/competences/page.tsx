import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { listSkillsForAdmin } from "@/server/services/skill.service";
import { NewSkillForm, SkillRow } from "./skill-forms";

export const metadata: Metadata = { title: "Compétences" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function AdminSkillsPage() {
  const skills = await listSkillsForAdmin();
  const categories = Object.keys(SKILL_CATEGORY_LABELS) as (keyof typeof SKILL_CATEGORY_LABELS)[];

  return (
    <>
      <AdminPageHeader
        title="Compétences"
        description="Utilisées dans la stack, les projets et le parcours. Une catégorie vide n'est pas affichée sur le site."
      />
      <div className="space-y-10">
        <section aria-labelledby="ajout-competence" className="rounded-xl border p-6">
          <h2 id="ajout-competence" className="mb-4 text-lg font-semibold">
            Ajouter une compétence
          </h2>
          <NewSkillForm />
        </section>

        {categories.map((category) => {
          const items = skills.filter((skill) => skill.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`categorie-${category}`}>
              <h2 id={`categorie-${category}`} className="mb-3 text-lg font-semibold">
                {SKILL_CATEGORY_LABELS[category]}
              </h2>
              <ul className="divide-y rounded-xl border">
                {items.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
