"use client";

import { CheckCircle2Icon, LoaderCircleIcon, SendIcon } from "lucide-react";
import { cloneElement, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HONEYPOT_FIELD, type ContactField } from "@/lib/validation/contact";
import { sendContactMessage, type ContactFormState } from "@/server/actions/contact.action";

const initialState: ContactFormState = { status: "idle" };

/** Section de contact : le formulaire, remplacé par une confirmation après envoi. */
export function ContactSection() {
  // Changer la clé remonte le formulaire, ce qui remet son état à zéro.
  const [formKey, setFormKey] = useState(0);
  return <ContactForm key={formKey} onReset={() => setFormKey((key) => key + 1)} />;
}

function ContactForm({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2Icon className="mx-auto size-10 text-emerald-500" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">Message envoyé</h2>
        <p className="mt-2 text-muted-foreground">Merci, votre message a bien été envoyé.</p>
        <Button variant="outline" className="mt-6" onClick={onReset}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    // noValidate : la validation est faite par le serveur (messages en français, règles uniques).
    <form action={formAction} noValidate className="space-y-5">
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Nom" error={errors.name}>
          <Input autoComplete="name" defaultValue={values.name} />
        </Field>
        <Field name="email" label="E-mail" error={errors.email}>
          <Input type="email" autoComplete="email" defaultValue={values.email} />
        </Field>
      </div>
      <Field name="subject" label="Sujet" error={errors.subject}>
        <Input defaultValue={values.subject} />
      </Field>
      <Field name="message" label="Message" error={errors.message}>
        <Textarea rows={6} className="min-h-36" defaultValue={values.message} />
      </Field>

      {/* Champ piège : hors écran et ignoré par les technologies d'assistance. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Vos informations servent uniquement à vous répondre.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {pending ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  name: ContactField;
  label: string;
  error?: string;
  children: React.ReactElement<React.ComponentProps<"input">>;
};

/** Associe libellé, champ et message d'erreur (id, name, aria-invalid, aria-describedby). */
function Field({ name, label, error, children }: FieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        name,
        required: true,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
