import { expect, test as setup } from "@playwright/test";
import { ADMIN, ADMIN_STORAGE_STATE } from "../config";

// Connexion unique : la session est enregistrée et réutilisée par tous les tests admin.
setup("connexion admin", async ({ page }) => {
  await page.goto("/admin/connexion");
  await page.getByLabel("E-mail").fill(ADMIN.email);
  await page.getByLabel("Mot de passe").fill(ADMIN.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
