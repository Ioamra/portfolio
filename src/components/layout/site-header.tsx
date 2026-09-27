import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getProfile } from "@/server/services/profile.service";
import { MainNav, MobileNav } from "./main-nav";

export async function SiteHeader() {
  const profile = await getProfile();

  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          {profile.fullName}
        </Link>
        <div className="flex items-center gap-1">
          <MainNav />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
