import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

test.describe.configure({ mode: "serial" });

test.describe("Admin — parcours", () => {
  test.beforeEach(async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
  });

  test("refuse une date de fin antérieure au début", async ({ page }) => {
    await page.goto("/admin/parcours/nouvelle");
    await page.getByLabel("Intitulé").fill("Expérience E2E");
    await page.getByLabel("Début").fill("2024-05");
    await page.getByLabel("Fin").fill("2023-01");
    await page.getByLabel("Description").fill("Description.");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("La fin doit être après le début.").first()).toBeVisible();
  });

  test("ajoute une expérience en cours, affichée en tête du parcours", async ({ page }) => {
    await page.goto("/admin/parcours/nouvelle");
    await page.getByLabel("Intitulé").fill("Expérience E2E");
    await page.getByLabel("Entreprise / établissement").fill("Entreprise E2E");
    await page.getByLabel("Début").fill("2026-09");
    await page.getByLabel("Description").fill("- Première réalisation\n- Seconde réalisation");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page).toHaveURL("/admin/parcours");

    await page.goto("/parcours");
    const first = page
      .getByRole("region", { name: "Expériences" })
      .getByRole("listitem")
      .filter({ has: page.getByRole("heading", { level: 3 }) })
      .first();
    await expect(first).toContainText("Expérience E2E");
    await expect(first).toContainText("septembre 2026 — aujourd'hui");
  });

  test("modifie puis supprime l'expérience", async ({ page }) => {
    await page.goto("/admin/parcours");
    await page.getByRole("link", { name: /Expérience E2E/ }).click();
    await page.getByLabel("Intitulé").fill("Expérience E2E modifiée");
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
    await expect(page.getByText("Enregistré.")).toBeVisible();

    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(page).toHaveURL("/admin/parcours");
    await page.goto("/parcours");
    await expect(page.getByText("Expérience E2E")).toHaveCount(0);
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/admin/parcours");
    await expectNoA11yViolations(page);
  });
});
