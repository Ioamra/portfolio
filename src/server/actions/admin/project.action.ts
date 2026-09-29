"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { parseFormData, type FormState } from "@/lib/form-state";
import { imageAltSchema, projectSchema } from "@/lib/validation/admin";
import { getUploadedFile, toErrorState } from "../../action-helpers";
import { requireAdminAction } from "../../auth-guard";
import { CACHE_TAGS } from "../../cache-tags";
import {
  addProjectImage,
  createProject,
  deleteProject,
  deleteProjectImage,
  moveProjectImage,
  updateProject,
  updateProjectImageAlt,
} from "../../services/project.service";
import { deleteStored, saveProjectImage } from "../../uploads";

const parseProject = (formData: FormData) =>
  parseFormData(projectSchema, formData, { multiple: ["skillIds"] });

export async function createProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseProject(formData);
  if (!parsed.success) return parsed.state;

  let projectId: string;
  try {
    projectId = (await createProject(parsed.data)).id;
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.projects);
  // Redirection vers l'édition, où l'on peut ajouter les images.
  redirect(`/admin/projets/${projectId}`);
}

export async function updateProjectAction(
  projectId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseProject(formData);
  if (!parsed.success) return parsed.state;

  try {
    await updateProject(projectId, parsed.data);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.projects);
  return { status: "success", message: "Projet enregistré." };
}

export async function deleteProjectAction(projectId: string) {
  await requireAdminAction();

  await deleteProject(projectId);
  updateTag(CACHE_TAGS.projects);
  redirect("/admin/projets");
}

export async function uploadProjectImageAction(
  projectId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseFormData(imageAltSchema, formData);
  if (!parsed.success) return parsed.state;

  const file = getUploadedFile(formData, "image");
  if (!file) {
    return {
      status: "error",
      message: "Choisissez une image.",
      fieldErrors: { image: "Choisissez une image." },
    };
  }

  const result = await saveProjectImage(projectId, file);
  if (!result.ok) {
    return { status: "error", message: result.error, fieldErrors: { image: result.error } };
  }

  try {
    await addProjectImage(projectId, result.path, parsed.data.alt);
  } catch (error) {
    await deleteStored(result.path); // pas de fichier orphelin si l'insertion échoue
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.projects);
  return { status: "success", message: "Image ajoutée." };
}

export async function updateImageAltAction(
  imageId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();

  const parsed = parseFormData(imageAltSchema, formData);
  if (!parsed.success) return parsed.state;

  try {
    await updateProjectImageAlt(imageId, parsed.data.alt);
  } catch (error) {
    return toErrorState(error);
  }

  updateTag(CACHE_TAGS.projects);
  return { status: "success", message: "Texte alternatif enregistré." };
}

export async function moveImageAction(imageId: string, direction: "up" | "down") {
  await requireAdminAction();

  await moveProjectImage(imageId, direction);
  updateTag(CACHE_TAGS.projects);
}

export async function deleteImageAction(imageId: string) {
  await requireAdminAction();

  await deleteProjectImage(imageId);
  updateTag(CACHE_TAGS.projects);
}
