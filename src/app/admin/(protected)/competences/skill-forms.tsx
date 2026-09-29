"use client";

import { Trash2Icon } from "lucide-react";
import { AdminForm, FormField } from "@/components/admin/admin-form";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Select } from "@/components/admin/fields";
import { Input } from "@/components/ui/input";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import {
  createSkillAction,
  deleteSkillAction,
  updateSkillAction,
} from "@/server/actions/admin/skill.action";
import type { SkillForAdmin } from "@/server/services/skill.service";

type SkillFieldsProps = { skill?: Pick<SkillForAdmin, "name" | "category" | "position"> };

function SkillFields({ skill }: SkillFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_12rem_6rem]">
      <FormField name="name" label="Nom">
        <Input defaultValue={skill?.name} />
      </FormField>
      <FormField name="category" label="Catégorie">
        <Select defaultValue={skill?.category ?? "LANGUAGE"}>
          {Object.entries(SKILL_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField name="position" label="Position">
        <Input type="number" min={0} defaultValue={skill?.position ?? 0} />
      </FormField>
    </div>
  );
}

export function NewSkillForm() {
  return (
    <AdminForm action={createSkillAction} id="new-skill" submitLabel="Ajouter" resetOnSuccess>
      <SkillFields />
    </AdminForm>
  );
}

export function SkillRow({ skill }: { skill: SkillForAdmin }) {
  const usage = skill._count.projects + skill._count.experiences;

  return (
    <li className="space-y-3 p-4">
      <AdminForm action={updateSkillAction.bind(null, skill.id)} id={`skill-${skill.id}`}>
        <SkillFields skill={skill} />
      </AdminForm>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          Utilisée par {skill._count.projects} projet(s) et {skill._count.experiences} expérience(s)
        </span>
        <ConfirmActionButton
          action={deleteSkillAction.bind(null, skill.id)}
          confirmMessage={
            usage > 0
              ? `« ${skill.name} » est utilisée ${usage} fois. La supprimer quand même ?`
              : `Supprimer « ${skill.name} » ?`
          }
          variant="ghost"
          size="sm"
        >
          <Trash2Icon data-icon="inline-start" />
          Supprimer
        </ConfirmActionButton>
      </div>
    </li>
  );
}
