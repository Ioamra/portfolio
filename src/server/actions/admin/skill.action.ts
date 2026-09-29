"use server";

import { updateTag } from "next/cache";
import { parseFormData, type FormState } from "@/lib/form-state";
import { skillSchema } from "@/lib/validation/admin";
import { toErrorState } from "../../action-helpers";
import { requireAdminAction } from "../../auth-guard";
import { CACHE_TAGS } from "../../cache-tags";
import { createSkill, deleteSkill, updateSkill } from "../../services/skill.service";

export async function createSkillAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseFormData(skillSchema, formData);
  if (!parsed.success) return parsed.state;

  try {
    await createSkill(parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.skills);
  return { status: "success", message: `« ${parsed.data.name} » ajoutée.` };
}

export async function updateSkillAction(
  skillId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseFormData(skillSchema, formData);
  if (!parsed.success) return parsed.state;

  try {
    await updateSkill(skillId, parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.skills);
  return { status: "success", message: "Enregistré." };
}

export async function deleteSkillAction(skillId: string) {
  await requireAdminAction();

  await deleteSkill(skillId);
  updateTag(CACHE_TAGS.skills);
}
