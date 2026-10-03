import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.describe("Parcours", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/parcours");
  });

  test("affiche les expériences, de la plus récente à la plus ancienne", async ({ page }) => {
    await expect(page).toHaveTitle("Parcours | Ioamra Monchau");
    const work = page.getByRole("region", { name: "Expériences" });
    const items = work
      .getByRole("listitem")
      .filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(items).toHaveCount(4);
    await expect(items.first()).toContainText("Synethis");
    await expect(items.first()).toContainText("septembre 2023 — août 2026");
    await expect(items.last()).toContainText("Arteuro");
  });

  test("affiche les formations avec leur établissement", async ({ page }) => {
    const education = page.getByRole("region", { name: "Formations" });
    await expect(education).toContainText("Titre RNCP niveau 7");
    await expect(education).toContainText(
      "Lycée Général et Technologique Paul Sabatier · Carcassonne",
    );
  });

  test("affiche les compétences et les savoir-faire", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Compétences" })).toContainText("TypeORM");
    await expect(page.getByRole("region", { name: "Savoir-faire" })).toContainText(
      "Concevoir et modéliser une base de données",
    );
  });

  test("permet de télécharger le CV", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Télécharger mon CV" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("CV_Ioamra_Monchau.pdf");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await expectNoA11yViolations(page);
  });
});
