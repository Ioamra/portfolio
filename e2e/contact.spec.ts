import { expect, test, type Page } from "@playwright/test";
import { TEST_ENV } from "./config";
import {
  clearMailbox,
  expectNoA11yViolations,
  getMailText,
  listMails,
  newVisitorPage,
} from "./helpers";

async function fillForm(page: Page, subject: string) {
  await page.getByLabel("Nom").fill("Camille Recruteuse");
  await page.getByLabel("E-mail").fill("camille@example.com");
  await page.getByLabel("Sujet").fill(subject);
  await page.getByLabel("Message").fill("Bonjour, votre profil correspond à un poste en CDI.");
}

const submit = (page: Page) => page.getByRole("button", { name: "Envoyer", exact: true }).click();

// Chaque test utilise un visiteur avec sa propre IP : la limite d'envois est calculée par IP.
test.describe("Contact", () => {
  test.beforeEach(async () => {
    await clearMailbox();
  });

  test("signale les champs invalides et conserve la saisie", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await page.goto("/contact");
    await page.getByLabel("Nom").fill("Camille");
    await page.getByLabel("E-mail").fill("pas-une-adresse");
    await submit(page);

    await expect(page.getByText("Certains champs sont invalides.")).toBeVisible();
    await expect(page.getByText("Adresse e-mail invalide.")).toBeVisible();
    await expect(page.getByText("Indiquez un sujet (3 caractères minimum).")).toBeVisible();
    await expect(page.getByText("Votre message est un peu court")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nom")).toHaveValue("Camille");
    expect(await listMails()).toHaveLength(0);
  });

  test("envoie le message par e-mail et confirme l'envoi", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await page.goto("/contact");
    await fillForm(page, "Poste de développeur back-end");
    await submit(page);

    await expect(page.getByRole("heading", { name: "Message envoyé" })).toBeVisible();
    await expect(page.getByText("Merci, votre message a bien été envoyé.")).toBeVisible();

    await expect.poll(async () => (await listMails()).length).toBe(1);
    const [mail] = await listMails();
    expect(mail.Subject).toBe("[Portfolio] Poste de développeur back-end");
    expect(mail.To[0].Address).toBe(TEST_ENV.MAIL_TO);
    // « Répondre » dans la messagerie répond directement au visiteur.
    expect(mail.ReplyTo[0].Address).toBe("camille@example.com");
    expect(await getMailText(mail.ID)).toContain("votre profil correspond à un poste en CDI");
  });

  test("permet d'envoyer un autre message avec un formulaire vide", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await page.goto("/contact");
    await fillForm(page, "Premier message");
    await submit(page);
    await page.getByRole("button", { name: "Envoyer un autre message" }).click();
    await expect(page.getByLabel("Nom")).toHaveValue("");
  });

  test("ignore les robots qui remplissent le champ piège", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await page.goto("/contact");
    await fillForm(page, "Message de robot");
    // Champ invisible pour un humain, placé hors de l'écran.
    await page
      .locator('input[name="website"]')
      .evaluate((input: HTMLInputElement) => (input.value = "https://spam.example"));
    await submit(page);

    // Le robot croit avoir réussi, mais rien n'est envoyé.
    await expect(page.getByRole("heading", { name: "Message envoyé" })).toBeVisible();
    await page.waitForTimeout(500);
    expect(await listMails()).toHaveLength(0);
  });

  test("limite le nombre de messages par visiteur", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    for (let i = 1; i <= 3; i++) {
      await page.goto("/contact");
      await fillForm(page, `Message ${i}`);
      await submit(page);
      await expect(page.getByRole("heading", { name: "Message envoyé" })).toBeVisible();
    }

    await page.goto("/contact");
    await fillForm(page, "Message 4");
    await submit(page);
    await expect(page.getByText("Trop de messages envoyés.", { exact: false })).toBeVisible();
    // La saisie est conservée pour réessayer plus tard.
    await expect(page.getByLabel("Sujet")).toHaveValue("Message 4");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/contact");
    await expectNoA11yViolations(page);
  });
});
