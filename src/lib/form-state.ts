import { z } from "zod";

/** Résultat d'une Server Action de formulaire, affiché par <AdminForm>. */
export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialFormState: FormState = { status: "idle" };

/**
 * Convertit un FormData en objet et le valide avec un schéma Zod.
 * - `multiple` : champs à valeurs multiples (cases à cocher partageant un même name).
 * - Les fichiers sont ignorés : ils sont traités à part par l'action.
 */
export function parseFormData<Schema extends z.ZodType>(
  schema: Schema,
  formData: FormData,
  { multiple = [] }: { multiple?: string[] } = {},
):
  | { success: true; data: z.infer<Schema> }
  | { success: false; state: Extract<FormState, { status: "error" }> } {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    raw[key] = multiple.includes(key) ? formData.getAll(key) : value;
  }
  for (const key of multiple) raw[key] ??= [];

  const result = schema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };

  const { fieldErrors, formErrors } = z.flattenError(result.error);
  return {
    success: false,
    state: {
      status: "error",
      message: formErrors[0] ?? "Certains champs sont invalides.",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors as Record<string, string[] | undefined>).map(
          ([field, messages]) => [field, messages?.[0] ?? "Valeur invalide."],
        ),
      ),
    },
  };
}
