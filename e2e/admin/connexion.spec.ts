import { expect, test, type Page } from "@playwright/test";
import { ADMIN } from "../config";
import { expectNoA11yViolations, newVisitorPage } from "../helpers";

async function signIn(page: Page, password: string) {
  await page.goto("/admin/connexion");
  await page.getByLabel("E-mail").fill(ADMIN.email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

// Visiteurs non connectés, chacun avec sa propre IP (limite de tentatives par IP).
test.describe("Connexion à l'admin", () => {
  test("les pages admin redirigent vers la connexion sans session", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    for (const path of ["/admin", "/admin/projets", "/admin/messages"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/admin/connexion");
    }
  });

  test("refuse un mauvais mot de passe sans préciser la cause", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await signIn(page, "mauvais-mot-de-passe");
    await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL("/admin/connexion");
  });

  test("bloque les tentatives répétées", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    for (let attempt = 1; attempt <= 5; attempt++) {
      await signIn(page, `essai-${attempt}`);
      await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
    }
    await signIn(page, "essai-6");
    await expect(page.getByText("Trop de tentatives. Réessayez dans une minute.")).toBeVisible();
  });

  test("connexion puis déconnexion", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await signIn(page, ADMIN.password);
    await expect(page).toHaveURL("/admin");

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL("/admin/connexion");
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin/connexion");
  });

  test("la page de connexion n'est pas indexée et reste accessible", async ({ browser }) => {
    const page = await newVisitorPage(browser);
    await page.goto("/admin/connexion");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expectNoA11yViolations(page);
  });
});
