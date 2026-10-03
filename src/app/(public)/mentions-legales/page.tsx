import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { MESSAGE_RETENTION_MONTHS } from "@/server/services/contact.service";
import { getProfile } from "@/server/services/profile.service";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et politique de confidentialité.",
  alternates: { canonical: "/mentions-legales" },
};

export default async function LegalNoticePage() {
  const profile = await getProfile();

  return (
    <PageTransition>
      <div className="container-page max-w-3xl py-16">
        <SectionHeading as="h1" eyebrow="Informations" title="Mentions légales" />

        <div className="prose mt-10 max-w-none prose-neutral dark:prose-invert prose-h2:text-xl">
          <h2>Éditeur du site</h2>
          <p>
            Ce site est le portfolio personnel et non commercial de {profile.fullName}.
            <br />
            Contact : via le <Link href="/contact">formulaire de contact</Link>.
          </p>

          <h2>Hébergement</h2>
          <p>Le site est hébergé sur un serveur personnel de l&apos;éditeur, situé en France.</p>

          <h2>Propriété intellectuelle</h2>
          <p>
            Les textes et contenus de ce site sont la propriété de {profile.fullName}, sauf mention
            contraire. Toute reproduction sans autorisation est interdite.
            {profile.githubUrl && (
              <>
                {" "}
                Le code source est consultable sur{" "}
                <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                .
              </>
            )}
          </p>

          <h2>Données personnelles</h2>
          <p>
            Le formulaire de contact collecte votre nom, votre adresse e-mail, le sujet et le
            contenu de votre message. Ces données servent uniquement à vous répondre : elles ne sont
            ni cédées, ni vendues, ni utilisées à des fins commerciales.
          </p>
          <ul>
            <li>
              <strong>Responsable du traitement :</strong> {profile.fullName}.
            </li>
            <li>
              <strong>Base légale :</strong> l&apos;intérêt légitime à répondre aux demandes qui me
              sont adressées.
            </li>
            <li>
              <strong>Destinataire :</strong> moi seul. Les messages me sont transmis par e-mail via
              un prestataire d&apos;envoi.
            </li>
            <li>
              <strong>Durée de conservation :</strong> {MESSAGE_RETENTION_MONTHS} mois au maximum,
              après quoi les messages sont supprimés automatiquement.
            </li>
          </ul>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement et d&apos;opposition sur vos données. Pour l&apos;exercer, écrivez-moi
            via le <Link href="/contact">formulaire de contact</Link>. Vous pouvez aussi adresser
            une réclamation à la{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
              CNIL
            </a>
            .
          </p>

          <h2>Cookies</h2>
          <p>
            Ce site n&apos;utilise aucun cookie publicitaire ni de suivi. Votre préférence de thème
            (clair ou sombre) est enregistrée uniquement dans votre navigateur. Un cookie de session
            est utilisé seulement pour l&apos;espace d&apos;administration réservé à l&apos;éditeur.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
