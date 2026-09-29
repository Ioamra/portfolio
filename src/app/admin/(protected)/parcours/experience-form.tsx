"use client";

import { AdminForm, FieldError, FormField } from "@/components/admin/admin-form";
import { Select, SkillPicker } from "@/components/admin/fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toMonthInputValue } from "@/lib/format";
import type { FormState } from "@/lib/form-state";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import type { ExperienceForAdmin } from "@/server/services/experience.service";

type ExperienceFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  experience?: ExperienceForAdmin;
  skills: { id: string; name: string; category: string }[];
  submitLabel: string;
};

export function ExperienceForm({ action, experience, skills, submitLabel }: ExperienceFormProps) {
  return (
    <AdminForm action={action} submitLabel={submitLabel} id="experience">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField name="type" label="Type">
          <Select defaultValue={experience?.type ?? "WORK"}>
            <option value="WORK">Expérience</option>
            <option value="EDUCATION">Formation</option>
          </Select>
        </FormField>
        <FormField name="startDate" label="Début">
          <Input type="month" defaultValue={toMonthInputValue(experience?.startDate ?? null)} />
        </FormField>
        <FormField name="endDate" label="Fin" hint="Vide = en cours.">
          <Input type="month" defaultValue={toMonthInputValue(experience?.endDate ?? null)} />
        </FormField>
      </div>
      <FormField name="title" label="Intitulé" hint="Poste ou diplôme.">
        <Input defaultValue={experience?.title} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="organization" label="Entreprise / établissement">
          <Input defaultValue={experience?.organization ?? ""} />
        </FormField>
        <FormField name="location" label="Lieu">
          <Input defaultValue={experience?.location ?? ""} />
        </FormField>
      </div>
      <FormField
        name="description"
        label="Description"
        hint="Markdown : une ligne commençant par « - » crée une puce."
      >
        <Textarea rows={6} defaultValue={experience?.description} />
      </FormField>
      <SkillPicker
        skills={skills}
        selectedIds={experience?.skills.map((skill) => skill.id) ?? []}
        categoryLabels={SKILL_CATEGORY_LABELS}
      />
      <FieldError name="skillIds" />
    </AdminForm>
  );
}
