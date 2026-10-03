import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

test.describe.configure({ mode: "serial" });

const addForm = (page: Page) => page.getByRole("region", { name: "Ajouter une compétence" });
// Ligne d'une compétence, repérée par la valeur de son champ « Nom ».
const skillRow = (page: Page, name: string) =>
  page.getByRole("listitem").filter({ has: page.locator(`input[name="name"][value="${name}"]`) });

test.describe("Admin — compétences", () => {
  test.beforeEach(async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/admin/competences");
  });

  test("ajoute une compétence, visible dans la stack de l'accueil", async ({ page }) => {
    await addForm(page).getByLabel("Nom").fill("Rust");
    await addForm(page).getByLabel("Catégorie").selectOption("BACKEND");
    await addForm(page).getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("« Rust » ajoutée.")).toBeVisible();
    await expect(addForm(page).getByLabel("Nom")).toHaveValue(""); // formulaire vidé

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Ma stack" })).toContainText("Rust");
  });

  test("refuse une compétence en double", async ({ page }) => {
    await addForm(page).getByLabel("Nom").fill("TypeScript");
    await addForm(page).getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Cette compétence existe déjà.").first()).toBeVisible();
  });

  test("renomme puis supprime la compétence", async ({ page }) => {
    const row = skillRow(page, "Rust");
    await row.getByLabel("Nom").fill("Rust (renommée)");
    await row.getByRole("button", { name: "Enregistrer" }).click();
    // La ligne est réaffichée avec le nouveau nom : on vérifie la confirmation sur la page.
    await expect(page.getByText("Enregistré.")).toBeVisible();

    await page.reload();
    await skillRow(page, "Rust (renommée)").getByRole("button", { name: "Supprimer" }).click();
    await expect(skillRow(page, "Rust (renommée)")).toHaveCount(0);

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Ma stack" })).not.toContainText("Rust");
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await expectNoA11yViolations(page);
  });
});
