import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatDateTime } from "@/lib/format";
import { listContactMessages } from "@/server/services/contact.service";
import { getDashboardStats } from "@/server/services/dashboard.service";

export const metadata: Metadata = { title: "Tableau de bord" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function DashboardPage() {
  const [stats, messages] = await Promise.all([getDashboardStats(), listContactMessages()]);

  const cards = [
    {
      href: "/admin/projets",
      label: "Projets",
      value: stats.projects,
      detail: `${stats.publishedProjects} publié(s)`,
    },
    { href: "/admin/parcours", label: "Expériences & formations", value: stats.experiences },
    { href: "/admin/competences", label: "Compétences", value: stats.skills },
    {
      href: "/admin/messages",
      label: "Messages non lus",
      value: stats.unreadMessages,
      highlight: stats.unreadMessages > 0,
    },
  ];

  return (
    <>
      <AdminPageHeader title="Tableau de bord" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="block rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`mt-1 text-3xl font-semibold ${card.highlight ? "text-primary" : ""}`}>
                {card.value}
              </p>
              {card.detail && <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="derniers-messages">
        <h2 id="derniers-messages" className="mb-4 text-lg font-semibold">
          Derniers messages
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {messages.slice(0, 5).map((message) => (
              <li key={message.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className={message.readAt ? "" : "font-semibold"}>
                    {message.name} — {message.subject}
                  </p>
                  <p className="truncate text-muted-foreground">{message.message}</p>
                </div>
                <time
                  dateTime={message.createdAt.toISOString()}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatDateTime(message.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
