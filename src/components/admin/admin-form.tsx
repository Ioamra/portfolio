"use client";

import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import {
  cloneElement,
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initialFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

type FormAction = (previous: FormState, formData: FormData) => Promise<FormState>;

const FormContext = createContext<{ state: FormState; pending: boolean; formId: string }>({
  state: initialFormState,
  pending: false,
  formId: "form",
});

type AdminFormProps = {
  action: FormAction;
  children: React.ReactNode;
  submitLabel?: string;
  /** Préfixe des id des champs (plusieurs formulaires sur une même page). */
  id?: string;
  /** Vide le formulaire après un succès (formulaires d'ajout). */
  resetOnSuccess?: boolean;
  className?: string;
};

/**
 * Formulaire admin : soumission via une Server Action, état « en cours », message global
 * et erreurs par champ (transmises aux <FormField> par contexte).
 *
 * La soumission passe par onSubmit + startTransition plutôt que par <form action> :
 * React vide un formulaire après une action, ce qui ferait perdre la saisie en cas
 * d'erreur de validation. Ici, les champs gardent leur contenu.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Enregistrer",
  id = "form",
  resetOnSuccess = false,
  className,
}: AdminFormProps) {
  const [state, dispatch, pending] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.status === "success") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return (
    <FormContext value={{ state, pending, formId: id }}>
      <form ref={formRef} onSubmit={onSubmit} noValidate className={cn("space-y-5", className)}>
        {children}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
            {submitLabel}
          </Button>
          <FormStatus state={state} />
        </div>
      </form>
    </FormContext>
  );
}

function FormStatus({ state }: { state: FormState }) {
  if (state.status === "success") {
    return (
      <p
        role="status"
        className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
      >
        <CheckCircle2Icon className="size-4" aria-hidden="true" />
        {state.message}
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {state.message}
      </p>
    );
  }
  return null;
}

type FormFieldProps = {
  name: string;
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactElement<React.ComponentProps<"input">>;
};

/** Libellé + champ + aide + erreur, reliés par id / aria-describedby. */
export function FormField({ name, label, hint, className, children }: FormFieldProps) {
  const { state, formId } = use(FormContext);
  const error = state.status === "error" ? state.fieldErrors?.[name] : undefined;
  const id = `${formId}-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Erreur d'un champ qui n'utilise pas <FormField> (groupe de cases à cocher…). */
export function FieldError({ name }: { name: string }) {
  const { state } = use(FormContext);
  const error = state.status === "error" ? state.fieldErrors?.[name] : undefined;
  return error ? <p className="text-sm text-destructive">{error}</p> : null;
}
