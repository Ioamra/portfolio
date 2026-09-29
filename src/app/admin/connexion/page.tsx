import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8">
        <div className="space-y-1">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
