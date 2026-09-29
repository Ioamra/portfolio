"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { parseFormData, type FormState } from "@/lib/form-state";
import { experienceSchema } from "@/lib/validation/admin";
import { toErrorState } from "../../action-helpers";
import { requireAdminAction } from "../../auth-guard";
import { CACHE_TAGS } from "../../cache-tags";
import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "../../services/experience.service";

const parseExperience = (formData: FormData) =>
  parseFormData(experienceSchema, formData, { multiple: ["skillIds"] });

export async function createExperienceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseExperience(formData);
  if (!parsed.success) return parsed.state;

  try {
    await createExperience(parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.experiences);
  redirect("/admin/parcours");
}

export async function updateExperienceAction(
  experienceId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseExperience(formData);
  if (!parsed.success) return parsed.state;

  try {
    await updateExperience(experienceId, parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.experiences);
  return { status: "success", message: "Enregistré." };
}

export async function deleteExperienceAction(experienceId: string) {
  await requireAdminAction();

  await deleteExperience(experienceId);
  updateTag(CACHE_TAGS.experiences);
  redirect("/admin/parcours");
}
