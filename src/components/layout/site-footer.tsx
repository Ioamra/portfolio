import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { getProfile } from "@/server/services/profile.service";

export async function SiteFooter() {
  const profile = await getProfile();
  const links = [
    { href: profile.githubUrl, label: "GitHub", Icon: GithubIcon },
    { href: profile.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  return (
    <footer className="border-t">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-4">
          {profile.fullName}
          <Link href="/mentions-legales" className="transition-colors hover:text-foreground">
            Mentions légales
          </Link>
        </p>
        {links.length > 0 && (
          <ul className="flex items-center gap-5">
            {links.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
