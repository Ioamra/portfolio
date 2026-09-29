import { Suspense } from "react";
import { requireAdminPage } from "@/server/auth-guard";
import { AdminNav } from "./admin-nav";

// Back-office privé : rendu à chaque requête, sans pré-rendu ni navigation instantanée
// (la barre de navigation lit l'URL courante, connue seulement à la requête).
export const instant = false;

/**
 * Layout des pages protégées. La barre latérale est statique ; le contenu n'est
 * rendu qu'après vérification de la session, sous un <Suspense> (lecture des cookies).
 * Chaque Server Action revérifie la session de son côté.
 */
export default function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav />
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <div className="mx-auto max-w-4xl">{children}</div>;
}
