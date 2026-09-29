"use client";

import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { AdminForm, FormField } from "@/components/admin/admin-form";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Input } from "@/components/ui/input";
import type { ProjectImage } from "@/generated/prisma/client";
import { mediaUrl } from "@/lib/media";
import {
  deleteImageAction,
  moveImageAction,
  updateImageAltAction,
  uploadProjectImageAction,
} from "@/server/actions/admin/project.action";

type ProjectImagesProps = {
  projectId: string;
  images: ProjectImage[];
};

export function ProjectImages({ projectId, images }: ProjectImagesProps) {
  return (
    <section aria-labelledby="images-titre" className="space-y-6 rounded-xl border p-6">
      <div>
        <h2 id="images-titre" className="text-lg font-semibold">
          Images
        </h2>
        <p className="text-sm text-muted-foreground">
          La première image sert de couverture sur les cartes. JPEG, PNG ou WebP, 5 Mo max.
        </p>
      </div>

      {images.length > 0 && (
        <ol className="space-y-4">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(image.path)}
                alt={image.alt}
                className="aspect-video w-full rounded-md border object-cover sm:w-48"
              />
              <div className="flex-1 space-y-3">
                <AdminForm
                  action={updateImageAltAction.bind(null, image.id)}
                  id={`image-${image.id}`}
                  submitLabel="Enregistrer le texte"
                >
                  <FormField
                    name="alt"
                    label={index === 0 ? "Texte alternatif (couverture)" : "Texte alternatif"}
                  >
                    <Input defaultValue={image.alt} />
                  </FormField>
                </AdminForm>
                <div className="flex gap-2">
                  <ConfirmActionButton
                    action={moveImageAction.bind(null, image.id, "up")}
                    disabled={index === 0}
                    variant="outline"
                    size="icon-sm"
                    aria-label="Monter"
                  >
                    <ArrowUpIcon />
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    action={moveImageAction.bind(null, image.id, "down")}
                    disabled={index === images.length - 1}
                    variant="outline"
                    size="icon-sm"
                    aria-label="Descendre"
                  >
                    <ArrowDownIcon />
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    action={deleteImageAction.bind(null, image.id)}
                    confirmMessage="Supprimer cette image ?"
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Supprimer
                  </ConfirmActionButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <AdminForm
        action={uploadProjectImageAction.bind(null, projectId)}
        id="new-image"
        submitLabel="Ajouter l'image"
        resetOnSuccess
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="image" label="Nouvelle image">
            <Input type="file" accept="image/jpeg,image/png,image/webp" />
          </FormField>
          <FormField name="alt" label="Texte alternatif" hint="Décrit l'image (accessibilité).">
            <Input />
          </FormField>
        </div>
      </AdminForm>
    </section>
  );
}
