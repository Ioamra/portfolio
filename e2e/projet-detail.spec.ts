import { expect, test } from "@playwright/test";
import { BASE_URL } from "./config";
import { expectNoA11yViolations } from "./helpers";

// Le carrousel d'images est testé dans admin/projets.spec.ts : les images
// s'ajoutent depuis l'admin.
test.describe("Page d'un projet", () => {
  test("affiche le contenu du projet", async ({ page }) => {
    await page.goto("/projets/paddockone-refonte-back-end");

    await expect(page).toHaveTitle("Refonte du back-end de PaddockOne | Ioamra Monchau");
    await expect(page.getByText("Professionnel")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "La migration des données" }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Technologies" })).toContainText("pgModeler");
    // Pas d'image pour ce projet : pas de carrousel.
    await expect(page.getByRole("region", { name: "Captures d'écran" })).toHaveCount(0);
  });

  test("déclare son URL canonique et son aperçu de partage", async ({ page }) => {
    await page.goto("/projets/paddockone-refonte-back-end");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${BASE_URL}/projets/paddockone-refonte-back-end`,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const response = await page.request.get(ogImage!);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("propose le lien vers le code source quand il existe", async ({ page }) => {
    await page.goto("/projets/portfolio");
    const link = page.getByRole("link", { name: "Code source" });
    await expect(link).toHaveAttribute("href", "https://github.com/ioamra/portfolio");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("le lien de retour mène à la liste des projets", async ({ page }) => {
    await page.goto("/projets/brawlhalla-tracker");
    await page.getByRole("link", { name: "Tous les projets" }).click();
    await expect(page).toHaveURL("/projets");
  });

  test("un projet inexistant renvoie une page 404", async ({ page }) => {
    const response = await page.goto("/projets/projet-inexistant");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/projets/paddockone-applications-metier");
    await expectNoA11yViolations(page);
  });
});
