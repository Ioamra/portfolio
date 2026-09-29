import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/button-link";
import type { ExperienceType } from "@/generated/prisma/enums";
import { formatPeriod } from "@/lib/format";
import { EXPERIENCE_TYPE_LABELS } from "@/lib/labels";
import { listExperiencesForAdmin } from "@/server/services/experience.service";

export const metadata: Metadata = { title: "Parcours" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

const TYPES: ExperienceType[] = ["WORK", "EDUCATION"];

export default async function AdminCareerPage() {
  const experiences = await listExperiencesForAdmin();

  return (
    <>
      <AdminPageHeader
        title="Parcours"
        description="Expériences et formations, triées comme sur le site."
        actions={
          <ButtonLink href="/admin/parcours/nouvelle">
            <PlusIcon data-icon="inline-start" />
            Ajouter
          </ButtonLink>
        }
      />
      <div className="space-y-10">
        {TYPES.map((type) => {
          const items = experiences.filter((experience) => experience.type === type);
          return (
            <section key={type} aria-labelledby={`admin-${type}`}>
              <h2 id={`admin-${type}`} className="mb-3 text-lg font-semibold">
                {EXPERIENCE_TYPE_LABELS[type]}
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun élément.</p>
              ) : (
                <ul className="divide-y rounded-xl border">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/admin/parcours/${item.id}`}
                        className="block p-4 transition-colors hover:bg-muted/40"
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {[item.organization, formatPeriod(item.startDate, item.endDate)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
