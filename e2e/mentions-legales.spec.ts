import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.describe("Mentions légales", () => {
  test("sont accessibles depuis le pied de page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Mentions légales" }).click();
    await expect(page).toHaveURL("/mentions-legales");
    await expect(page.getByRole("heading", { level: 1, name: "Mentions légales" })).toBeVisible();
  });

  test("présentent l'éditeur, les données personnelles et les cookies", async ({ page }) => {
    await page.goto("/mentions-legales");
    for (const section of ["Éditeur du site", "Hébergement", "Données personnelles", "Cookies"]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }
    await expect(page.getByText("12 mois au maximum")).toBeVisible();
    await expect(page.getByRole("link", { name: "CNIL" })).toHaveAttribute(
      "href",
      "https://www.cnil.fr",
    );
  });

  test("ne présentent pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expectNoA11yViolations(page);
  });
});
