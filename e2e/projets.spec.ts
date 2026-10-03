import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.describe("Liste des projets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projets");
  });

  test("affiche tous les projets publiés", async ({ page }) => {
    await expect(page).toHaveTitle("Projets | Ioamra Monchau");
    await expect(
      page.getByRole("heading", { level: 1, name: "Ce que j'ai construit" }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(7);
  });

  test("filtre les projets par technologie", async ({ page }) => {
    const filters = page.getByRole("group", { name: "Filtrer par technologie" });
    await expect(filters.getByRole("button", { name: "Tous" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await filters.getByRole("button", { name: "React" }).click();
    await expect(filters.getByRole("button", { name: "React" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText("Brawlhalla Tracker");
    // Le nombre de résultats est annoncé aux lecteurs d'écran.
    await expect(page.getByText("1 projet affiché")).toBeAttached();

    await filters.getByRole("button", { name: "PostgreSQL" }).click();
    await expect(page.getByRole("article")).toHaveCount(3);

    await filters.getByRole("button", { name: "Tous" }).click();
    await expect(page.getByRole("article")).toHaveCount(7);
  });

  test("une carte mène à la page du projet", async ({ page }) => {
    await page.getByRole("link", { name: "Brawlhalla Tracker" }).click();
    await expect(page).toHaveURL("/projets/brawlhalla-tracker");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await expectNoA11yViolations(page);
  });
});
