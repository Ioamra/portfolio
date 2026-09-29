"use client";

import { useState } from "react";
import { AdminForm, FieldError, FormField } from "@/components/admin/admin-form";
import { Checkbox, Select, SkillPicker } from "@/components/admin/fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/form-state";
import { PROJECT_KIND_LABELS, SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { slugify } from "@/lib/slug";
import type { ProjectForAdmin } from "@/server/services/project.service";

type ProjectFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  project?: ProjectForAdmin;
  skills: { id: string; name: string; category: string }[];
  submitLabel: string;
};

export function ProjectForm({ action, project, skills, submitLabel }: ProjectFormProps) {
  // Le slug suit le titre tant qu'il n'a pas été modifié à la main (création uniquement).
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  return (
    <AdminForm action={action} submitLabel={submitLabel} id="project">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="title" label="Titre">
          <Input
            defaultValue={project?.title}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
        </FormField>
        <FormField name="slug" label="Slug" hint="Adresse de la page : /projets/<slug>">
          <Input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
          />
        </FormField>
      </div>
      <FormField name="summary" label="Résumé" hint="Affiché sur les cartes (300 caractères max).">
        <Textarea rows={2} defaultValue={project?.summary} />
      </FormField>
      <FormField
        name="content"
        label="Contenu"
        hint="Markdown : ## Titre, - liste, **gras**, [lien](url)."
      >
        <Textarea rows={14} className="font-mono text-sm" defaultValue={project?.content} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField name="kind" label="Type">
          <Select defaultValue={project?.kind ?? "PERSONAL"}>
            {Object.entries(PROJECT_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField name="position" label="Position" hint="0 = en premier.">
          <Input type="number" min={0} defaultValue={project?.position ?? 0} />
        </FormField>
        <div className="space-y-3 sm:pt-6">
          <Checkbox name="published" label="Publié" defaultChecked={project?.published ?? false} />
          <Checkbox
            name="featured"
            label="À la une (accueil)"
            defaultChecked={project?.featured ?? false}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="repoUrl" label="Code source (URL)">
          <Input type="url" defaultValue={project?.repoUrl ?? ""} />
        </FormField>
        <FormField name="demoUrl" label="Démo (URL)">
          <Input type="url" defaultValue={project?.demoUrl ?? ""} />
        </FormField>
      </div>

      <SkillPicker
        skills={skills}
        selectedIds={project?.skills.map((skill) => skill.id) ?? []}
        categoryLabels={SKILL_CATEGORY_LABELS}
      />
      <FieldError name="skillIds" />
    </AdminForm>
  );
}
