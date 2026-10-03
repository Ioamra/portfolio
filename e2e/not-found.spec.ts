import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.describe("Page introuvable", () => {
  test("renvoie un vrai code 404 et une page aux couleurs du site", async ({ page }) => {
    const response = await page.goto("/cette-page-n-existe-pas");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page introuvable | Ioamra Monchau");
    await expect(page.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeVisible();
    // En-tête et pied de page restent disponibles pour repartir.
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("propose de revenir à l'accueil", async ({ page }) => {
    await page.goto("/cette-page-n-existe-pas");
    await page.getByRole("link", { name: "Retour à l'accueil" }).click();
    await expect(page).toHaveURL("/");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/cette-page-n-existe-pas");
    await expectNoA11yViolations(page);
  });
});
