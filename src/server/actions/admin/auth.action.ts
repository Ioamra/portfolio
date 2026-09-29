"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseFormData, type FormState } from "@/lib/form-state";
import { auth } from "../../auth";
import { LOGIN_PATH } from "../../auth-guard";

const signInSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe obligatoire."),
});

export async function signInAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseFormData(signInSchema, formData);
  if (!parsed.success) return parsed.state;

  try {
    // Le plugin nextCookies pose le cookie de session depuis la Server Action.
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      // Message volontairement vague : ne pas révéler si l'e-mail existe.
      const message =
        error.status === "TOO_MANY_REQUESTS"
          ? "Trop de tentatives. Réessayez dans une minute."
          : "E-mail ou mot de passe incorrect.";
      return { status: "error", message };
    }
    throw error;
  }

  redirect("/admin");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect(LOGIN_PATH);
}
