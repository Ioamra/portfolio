import { getProfile } from "@/server/services/profile.service";
import { GithubIcon } from "@/components/icons";

export async function SiteFooter() {
  const profile = await getProfile();

  return (
    <footer className="border-t">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>{profile.fullName}</p>
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        )}
      </div>
    </footer>
  );
}
