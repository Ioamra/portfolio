"use client";

import {
  BriefcaseIcon,
  ExternalLinkIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  TagsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/admin/auth.action";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboardIcon },
  { href: "/admin/profil", label: "Profil & CV", Icon: UserIcon },
  { href: "/admin/projets", label: "Projets", Icon: FolderKanbanIcon },
  { href: "/admin/parcours", label: "Parcours", Icon: BriefcaseIcon },
  { href: "/admin/competences", label: "Compétences", Icon: TagsIcon },
  { href: "/admin/messages", label: "Messages", Icon: MailIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b bg-muted/30 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm font-semibold">Admin</p>
          <ThemeToggle />
        </div>
        <nav aria-label="Administration" className="flex-1">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {LINKS.map(({ href, label, Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-muted",
                      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex gap-2 md:flex-col">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <ExternalLinkIcon className="size-4" aria-hidden="true" />
            Voir le site
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start">
              <LogOutIcon data-icon="inline-start" />
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
