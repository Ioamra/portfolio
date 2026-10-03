import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

test.describe.configure({ mode: "serial" });

// Les messages viennent de contact.spec.ts, exécuté avant les tests admin.
test.describe("Admin — messages", () => {
  const message = (page: import("@playwright/test").Page) =>
    page.getByRole("listitem").filter({ hasText: "Poste de développeur back-end" });

  test.beforeEach(async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/admin/messages");
  });

  test("affiche les messages reçus avec un lien de réponse", async ({ page }) => {
    await expect(message(page)).toContainText("camille@example.com");
    await expect(message(page)).toContainText("Non lu");
    await expect(message(page).getByRole("link", { name: "Répondre" })).toHaveAttribute(
      "href",
      /^mailto:camille@example\.com\?subject=Re%3A%20Poste/,
    );
  });

  test("marque un message comme lu puis non lu", async ({ page }) => {
    await message(page).getByRole("button", { name: "Marquer lu" }).click();
    await expect(message(page).getByRole("button", { name: "Marquer non lu" })).toBeVisible();
    await expect(message(page)).not.toContainText("Non lu");

    await message(page).getByRole("button", { name: "Marquer non lu" }).click();
    await expect(message(page)).toContainText("Non lu");
  });

  test("supprime un message", async ({ page }) => {
    await message(page).getByRole("button", { name: "Supprimer" }).click();
    await expect(message(page)).toHaveCount(0);
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await expectNoA11yViolations(page);
  });
});
