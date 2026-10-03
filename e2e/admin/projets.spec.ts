import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers";

// Les tests s'enchaînent sur un même projet : création → images → publication → suppression.
test.describe.configure({ mode: "serial" });

const TITLE = "Projet E2E Éphémère";
const SLUG = "projet-e2e-ephemere";
let editUrl = "";

const save = (page: Page) => page.getByRole("button", { name: "Enregistrer", exact: true }).click();

async function uploadImage(page: Page, file: string, alt: string) {
  // Identifiants des champs du formulaire d'ajout (id du formulaire « new-image »).
  await page.locator("#new-image-image").setInputFiles(file);
  await page.locator("#new-image-alt").fill(alt);
  await page.getByRole("button", { name: "Ajouter l'image" }).click();
}

test.describe("Admin — projets", () => {
  test.beforeEach(async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
  });

  test("liste les projets", async ({ page }) => {
    await page.goto("/admin/projets");
    await expect(page.getByRole("row")).toHaveCount(8); // en-tête + 7 projets
    await expect(page.getByRole("row", { name: /Refonte du back-end/ })).toContainText("Publié");
  });

  test("signale les champs obligatoires", async ({ page }) => {
    await page.goto("/admin/projets/nouveau");
    await page.getByRole("button", { name: "Créer le projet" }).click();
    await expect(page.getByText("Le titre est obligatoire.")).toBeVisible();
    await expect(page.getByText("Le résumé est obligatoire.")).toBeVisible();
  });

  test("refuse un slug déjà utilisé", async ({ page }) => {
    await page.goto("/admin/projets/nouveau");
    await page.getByLabel("Titre").fill("Doublon");
    await page.getByLabel("Slug").fill("portfolio");
    await page.getByLabel("Résumé").fill("Résumé.");
    await page.getByLabel("Contenu").fill("Contenu.");
    await page.getByRole("button", { name: "Créer le projet" }).click();
    await expect(page.getByText("Ce slug est déjà utilisé.").first()).toBeVisible();
  });

  test("crée un projet publié, visible sur le site", async ({ page }) => {
    await page.goto("/admin/projets/nouveau");
    await page.getByLabel("Titre").fill(TITLE);
    await expect(page.getByLabel("Slug")).toHaveValue(SLUG); // généré depuis le titre
    await page.getByLabel("Résumé").fill("Résumé du projet de test.");
    await page.getByLabel("Contenu").fill("## Section de test\n\nContenu **Markdown**.");
    await page.getByLabel("Publié").check();
    await page.getByRole("checkbox", { name: "React" }).check();
    await page.getByRole("button", { name: "Créer le projet" }).click();

    await expect(page).toHaveURL(/\/admin\/projets\/(?!nouveau)[^/]+$/);
    editUrl = new URL(page.url()).pathname;

    await page.goto(`/projets/${SLUG}`);
    await expect(page.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Section de test" })).toBeVisible();
    await page.goto("/projets");
    await expect(page.getByRole("article")).toHaveCount(8);
  });

  test("refuse un fichier qui n'est pas une image", async ({ page }) => {
    await page.goto(editUrl);
    await uploadImage(page, "e2e/fixtures/not-an-image.png", "Faux fichier");
    await expect(page.getByText("Format non pris en charge").first()).toBeVisible();
  });

  test("ajoute des images, affichées en carrousel sur la page du projet", async ({ page }) => {
    await page.goto(editUrl);
    await uploadImage(page, "e2e/fixtures/image-1.png", "Première capture");
    await expect(page.getByText("Image ajoutée.")).toBeVisible();
    await uploadImage(page, "e2e/fixtures/image-2.png", "Seconde capture");
    await expect(page.getByRole("img", { name: "Seconde capture" })).toBeVisible();

    await page.goto(`/projets/${SLUG}`);
    const gallery = page.getByRole("region", { name: "Captures d'écran" });
    await expect(gallery.getByRole("img")).toHaveCount(2);
    await expect(gallery.getByText("Première capture")).toBeVisible();
    await gallery.getByRole("button", { name: "Image suivante" }).click();
    await expect(gallery.getByRole("button", { name: "Afficher l'image 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(gallery.getByText("Seconde capture")).toBeVisible();
  });

  test("réordonner les images change la couverture de la carte", async ({ page }) => {
    await page.goto(editUrl);
    await page.getByRole("button", { name: "Monter" }).nth(1).click();
    await expect(page.getByLabel("Texte alternatif (couverture)")).toHaveValue("Seconde capture");

    await page.goto("/projets");
    await expect(
      page.getByRole("article").filter({ hasText: TITLE }).getByRole("img"),
    ).toHaveAttribute("alt", "Seconde capture");
  });

  test("dépublier retire le projet du site", async ({ page }) => {
    await page.goto(editUrl);
    await page.getByLabel("Publié").uncheck();
    await save(page);
    await expect(page.getByText("Projet enregistré.")).toBeVisible();

    const response = await page.goto(`/projets/${SLUG}`);
    expect(response?.status()).toBe(404);
  });

  test("supprime le projet et ses images", async ({ page }) => {
    await page.goto(editUrl);
    const imageSrc = await page.getByRole("img", { name: "Première capture" }).getAttribute("src");
    await page.getByRole("button", { name: "Supprimer", exact: true }).first().click();

    await expect(page).toHaveURL("/admin/projets");
    await expect(page.getByRole("row")).toHaveCount(8);
    expect((await page.request.get(imageSrc!)).status()).toBe(404);
  });

  test("ne présente pas de problème d'accessibilité", async ({ page }) => {
    await page.goto("/admin/projets/nouveau");
    await expectNoA11yViolations(page);
  });
});
