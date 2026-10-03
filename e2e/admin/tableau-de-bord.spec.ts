import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

test.describe("Admin — tableau de bord", () => {
  test("affiche les compteurs et les derniers messages", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Tableau de bord" })).toBeVisible();

    const projects = page.getByRole("main").getByRole("link", { name: /^Projets/ });
    await expect(projects).toContainText("7");
    await expect(projects).toContainText("7 publié(s)");

    // Messages envoyés par contact.spec.ts (exécuté avant les tests admin).
    await expect(page.getByRole("region", { name: "Derniers messages" })).toContainText(
      "Camille Recruteuse",
    );
  });

  test("les cartes mènent aux sections correspondantes", async ({ page }) => {
    await page.goto("/admin");
    await page
      .getByRole("main")
      .getByRole("link", { name: /^Compétences/ })
      .click();
    await expect(page).toHaveURL("/admin/competences");
  });

  test("la navigation signale la page courante", async ({ page }) => {
    await page.goto("/admin/parcours");
    const nav = page.getByRole("navigation", { name: "Administration" });
    await expect(nav.getByRole("link", { name: "Parcours" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/admin");
    await expectNoA11yViolations(page);
  });
});
