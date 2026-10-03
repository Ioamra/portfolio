import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

test.describe.configure({ mode: "serial" });

test.describe("Admin — profil et CV", () => {
  test.beforeEach(async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/admin/profil");
  });

  test("une modification du profil est visible sur le site", async ({ page }) => {
    const availability = page.getByLabel("Disponibilité");
    const original = await availability.inputValue();

    await availability.fill("Disponible dès maintenant (test E2E)");
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
    await expect(page.getByText("Profil enregistré.")).toBeVisible();

    // Le cache de l'accueil est invalidé : la nouvelle valeur s'affiche aussitôt.
    await page.goto("/");
    await expect(page.getByText("Disponible dès maintenant (test E2E)")).toBeVisible();

    // Remise en état pour les tests suivants.
    await page.goto("/admin/profil");
    await page.getByLabel("Disponibilité").fill(original);
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
    await expect(page.getByText("Profil enregistré.")).toBeVisible();
  });

  test("refuse une URL invalide sans perdre la saisie", async ({ page }) => {
    await page.getByLabel("Localisation").fill("Marseille (13)");
    await page.getByLabel("GitHub").fill("pas une url");
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();

    await expect(page.getByText("URL invalide.")).toBeVisible();
    await expect(page.getByLabel("GitHub")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Localisation")).toHaveValue("Marseille (13)");
  });

  test("refuse un CV qui n'est pas un PDF", async ({ page }) => {
    await page.getByLabel(/CV \(PDF, 5 Mo max\)/).setInputFiles("e2e/fixtures/not-an-image.png");
    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("Le CV doit être un fichier PDF.").first()).toBeVisible();
  });

  test("retirer puis renvoyer le CV met à jour le site", async ({ page }) => {
    await page.getByRole("button", { name: "Retirer" }).click();
    await expect(page.getByText("Aucun CV : le bouton de téléchargement est masqué")).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Télécharger mon CV" })).toHaveCount(0);

    await page.goto("/admin/profil");
    await page.getByLabel(/CV \(PDF, 5 Mo max\)/).setInputFiles("e2e/fixtures/cv-test.pdf");
    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("CV mis à jour.")).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("link", { name: "Télécharger mon CV" })).toBeVisible();
    const response = await page.request.get("/cv");
    expect(response.headers()["content-type"]).toBe("application/pdf");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await expectNoA11yViolations(page);
  });
});
