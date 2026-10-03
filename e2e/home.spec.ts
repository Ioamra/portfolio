import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

test.describe("Accueil", () => {
  test("présente le profil et les projets à la une", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Ioamra Monchau — Développeur Full-Stack · Angular / NestJS");
    // Le nom est dessiné en particules ; le vrai titre reste dans le DOM pour le SEO.
    await expect(page.getByRole("heading", { level: 1, name: "Ioamra Monchau" })).toBeAttached();
    await expect(page.getByText("En recherche d'un poste de développeur full-stack")).toBeVisible();
    await expect(page.getByText("Développeur Full-Stack · Angular / NestJS").first()).toBeVisible();

    const featured = page.getByRole("region", { name: "Projets à la une" });
    await expect(featured.getByRole("article")).toHaveCount(3);
    await expect(
      featured.getByRole("link", { name: "Refonte du back-end de PaddockOne" }),
    ).toBeVisible();

    const stack = page.getByRole("region", { name: "Ma stack" });
    await expect(stack.getByText("Langages")).toBeVisible();
    await expect(stack.getByText("NestJS")).toBeVisible();
  });

  test("une carte projet mène à la page du projet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Refonte du back-end de PaddockOne" }).click();
    await expect(page).toHaveURL("/projets/paddockone-refonte-back-end");
    await expect(
      page.getByRole("heading", { level: 1, name: "Refonte du back-end de PaddockOne" }),
    ).toBeVisible();
  });

  test("les boutons d'action mènent aux projets et au contact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Voir mes projets" }).click();
    await expect(page).toHaveURL("/projets");

    await page.goto("/");
    await page.getByRole("link", { name: "Me contacter" }).first().click();
    await expect(page).toHaveURL("/contact");
  });

  test("le CV se télécharge avec un nom de fichier explicite", async ({ page }) => {
    await page.goto("/");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Télécharger mon CV" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("CV_Ioamra_Monchau.pdf");
  });

  test("le thème bascule entre clair et sombre et reste mémorisé", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Changer de thème" }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test("le lien d'évitement est le premier élément au clavier", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenu$/);
  });

  test("le menu mobile permet de naviguer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Parcours" }).click();
    await expect(page).toHaveURL("/parcours");
    await expect(menu).toBeHidden();
  });

  test("ne présente pas de problème d'accessibilité (thèmes clair et sombre)", async ({ page }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/");
      await expectNoA11yViolations(page);
    }
  });
});
