import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Me contacter pour un poste ou un projet.",
};

// Le formulaire de contact sera ajouté à l'étape 3.
export default function ContactPage() {
  return (
    <PageTransition>
      <div className="container-page py-16">
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Me contacter"
          description="Un poste, une question ? Écrivez-moi, je réponds rapidement."
        />
      </div>
    </PageTransition>
  );
}
