import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/button-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Next ajoute lui-même <meta name="robots" content="noindex"> sur les pages 404.
export const metadata: Metadata = { title: "Page introuvable" };

// 404 globale (URL inconnue, projet inexistant…). Hors du groupe (public) :
// l'en-tête et le pied de page sont ajoutés ici directement.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-page flex flex-1 flex-col items-start justify-center gap-6 py-24">
        <p className="font-mono text-sm text-primary">Erreur 404</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page introuvable</h1>
        <p className="max-w-md text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <ButtonLink href="/" variant="outline">
          <ArrowLeftIcon data-icon="inline-start" />
          Retour à l&apos;accueil
        </ButtonLink>
      </main>
      <SiteFooter />
    </>
  );
}
