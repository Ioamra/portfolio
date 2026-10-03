import AxeBuilder from "@axe-core/playwright";
import { expect, type Browser, type Page } from "@playwright/test";
import { BASE_URL, MAILPIT_URL } from "./config";

/** Audit d'accessibilité automatique (WCAG 2.1 AA) de la page courante. */
export async function expectNoA11yViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    // Les éléments fautifs sont listés pour corriger sans relancer l'audit à la main.
    violations.map(
      (violation) =>
        `${violation.id} : ${violation.help} → ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    ),
    "Violations d'accessibilité",
  ).toEqual([]);
}

/**
 * Adresse IP fictive et unique : les limites d'envoi (contact) et de connexion (admin)
 * sont calculées par IP, lue dans l'en-tête cf-connecting-ip (posé par Cloudflare en prod).
 */
export function uniqueIp() {
  const byte = () => Math.floor(Math.random() * 254) + 1;
  return `10.${byte()}.${byte()}.${byte()}`;
}

/** Page dans un contexte isolé simulant un visiteur avec sa propre IP. */
export async function newVisitorPage(browser: Browser) {
  // Session vide explicite : sinon Playwright applique celle du projet (tests admin),
  // et le « visiteur » serait déjà connecté.
  const context = await browser.newContext({
    baseURL: BASE_URL,
    storageState: { cookies: [], origins: [] },
    locale: "fr-FR",
    extraHTTPHeaders: { "cf-connecting-ip": uniqueIp() },
  });
  return context.newPage();
}

// --- Mailpit (faux serveur SMTP du docker-compose) ----------------------------

type MailpitMessage = {
  ID: string;
  Subject: string;
  To: { Address: string }[];
  ReplyTo: { Address: string; Name: string }[];
};

export async function clearMailbox() {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: "DELETE" });
}

export async function listMails(): Promise<MailpitMessage[]> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`);
  return (await response.json()).messages;
}

/** Texte brut d'un mail. */
export async function getMailText(id: string): Promise<string> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`);
  return (await response.json()).Text;
}
