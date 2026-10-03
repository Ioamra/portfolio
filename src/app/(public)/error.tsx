"use client";

import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Erreur inattendue dans une page publique : l'en-tête et le pied de page restent affichés.
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-start gap-6 py-24">
      <p className="font-mono text-sm text-primary">Erreur</p>
      <h1 className="text-3xl font-semibold tracking-tight">Un problème est survenu</h1>
      <p className="max-w-md text-muted-foreground">
        La page n&apos;a pas pu être affichée. Réessayez dans un instant.
      </p>
      <Button variant="outline" onClick={reset}>
        <RotateCcwIcon data-icon="inline-start" />
        Réessayer
      </Button>
    </div>
  );
}
