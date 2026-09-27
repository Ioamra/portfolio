import { SkillList } from "@/components/skill-list";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { groupSkillsByCategory, listSkills } from "@/server/services/skill.service";

export async function SkillsByCategory() {
  const groups = groupSkillsByCategory(await listSkills());

  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      {[...groups].map(([category, skills]) => (
        <div key={category} className="space-y-2">
          <dt className="text-sm font-medium">{SKILL_CATEGORY_LABELS[category]}</dt>
          <dd>
            <SkillList skills={skills} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
