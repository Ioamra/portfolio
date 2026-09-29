"use server";

import { updateTag } from "next/cache";
import { parseFormData, type FormState } from "@/lib/form-state";
import { profileSchema } from "@/lib/validation/admin";
import { getUploadedFile, toErrorState } from "../../action-helpers";
import { requireAdminAction } from "../../auth-guard";
import { CACHE_TAGS } from "../../cache-tags";
import { setCvPath, updateProfile } from "../../services/profile.service";
import { deleteStored, saveCv } from "../../uploads";

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseFormData(profileSchema, formData);
  if (!parsed.success) return parsed.state;

  try {
    await updateProfile(parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.profile);
  return { status: "success", message: "Profil enregistré." };
}

export async function uploadCvAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdminAction();

  const file = getUploadedFile(formData, "cv");
  if (!file) return { status: "error", message: "Choisissez un fichier PDF." };

  const result = await saveCv(file);
  if (!result.ok) {
    return { status: "error", message: result.error, fieldErrors: { cv: result.error } };
  }

  await setCvPath(result.path);
  updateTag(CACHE_TAGS.profile);
  return { status: "success", message: "CV mis à jour." };
}

export async function deleteCvAction() {
  await requireAdminAction();

  await setCvPath(null);
  await deleteStored("cv/cv.pdf");
  updateTag(CACHE_TAGS.profile);
}
