"use client";

import { AdminForm, FormField } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/server/actions/admin/auth.action";

export function LoginForm() {
  return (
    <AdminForm action={signInAction} submitLabel="Se connecter" id="login">
      <FormField name="email" label="E-mail">
        <Input type="email" autoComplete="username" required />
      </FormField>
      <FormField name="password" label="Mot de passe">
        <Input type="password" autoComplete="current-password" required />
      </FormField>
    </AdminForm>
  );
}
