import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getProfileForAdmin } from "@/server/services/profile.service";
import { CvSection } from "./cv-section";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil & CV" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function AdminProfilePage() {
  const profile = await getProfileForAdmin();

  return (
    <>
      <AdminPageHeader
        title="Profil & CV"
        description="Informations affichées sur l'accueil, la page Parcours et le pied de page."
      />
      <div className="space-y-12">
        <ProfileForm profile={profile} />
        <CvSection hasCv={Boolean(profile.cvPath)} />
      </div>
    </>
  );
}
