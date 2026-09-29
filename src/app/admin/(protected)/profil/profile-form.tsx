"use client";

import { AdminForm, FormField } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/generated/prisma/client";
import { updateProfileAction } from "@/server/actions/admin/profile.action";

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <AdminForm action={updateProfileAction} id="profile">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="fullName" label="Nom complet">
          <Input defaultValue={profile.fullName} />
        </FormField>
        <FormField name="location" label="Localisation" hint="Ville ou région, jamais l'adresse.">
          <Input defaultValue={profile.location ?? ""} />
        </FormField>
      </div>
      <FormField name="headline" label="Titre">
        <Input defaultValue={profile.headline} />
      </FormField>
      <FormField
        name="availability"
        label="Disponibilité"
        hint="Badge de l'accueil ; vide = masqué."
      >
        <Input defaultValue={profile.availability ?? ""} />
      </FormField>
      <FormField name="bio" label="Présentation">
        <Textarea rows={5} defaultValue={profile.bio} />
      </FormField>
      <FormField name="strengths" label="Savoir-faire" hint="Un par ligne.">
        <Textarea rows={6} defaultValue={profile.strengths.join("\n")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="githubUrl" label="GitHub">
          <Input type="url" defaultValue={profile.githubUrl ?? ""} />
        </FormField>
        <FormField name="linkedinUrl" label="LinkedIn">
          <Input type="url" defaultValue={profile.linkedinUrl ?? ""} />
        </FormField>
      </div>
    </AdminForm>
  );
}
