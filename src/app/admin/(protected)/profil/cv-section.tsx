"use client";

import { ExternalLinkIcon, Trash2Icon } from "lucide-react";
import { AdminForm, FormField } from "@/components/admin/admin-form";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Input } from "@/components/ui/input";
import { deleteCvAction, uploadCvAction } from "@/server/actions/admin/profile.action";

export function CvSection({ hasCv }: { hasCv: boolean }) {
  return (
    <section aria-labelledby="cv-titre" className="space-y-4 rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="cv-titre" className="text-lg font-semibold">
          CV téléchargeable
        </h2>
        {hasCv && (
          <div className="flex gap-2">
            <a
              href="/cv"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
              Voir le CV actuel
            </a>
            <ConfirmActionButton
              action={deleteCvAction}
              confirmMessage="Retirer le CV du site ?"
              variant="ghost"
              size="sm"
            >
              <Trash2Icon data-icon="inline-start" />
              Retirer
            </ConfirmActionButton>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {hasCv
          ? "Le bouton « Télécharger mon CV » est affiché sur le site."
          : "Aucun CV : le bouton de téléchargement est masqué sur le site."}{" "}
        Pensez à une version sans adresse ni téléphone : ce fichier est public.
      </p>
      <AdminForm action={uploadCvAction} id="cv" submitLabel="Envoyer" resetOnSuccess>
        <FormField
          name="cv"
          label={hasCv ? "Remplacer le CV (PDF, 5 Mo max)" : "CV (PDF, 5 Mo max)"}
        >
          <Input type="file" accept="application/pdf" />
        </FormField>
      </AdminForm>
    </section>
  );
}
