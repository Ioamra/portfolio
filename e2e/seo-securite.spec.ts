import { expect, test } from "@playwright/test";
import { BASE_URL } from "./config";

// Routes techniques sans page visible : SEO, fichiers servis et protections.
test.describe("SEO", () => {
  test("robots.txt interdit l'admin et indique le sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api");
    expect(body).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`);
  });

  test("le sitemap liste les pages et les projets publiés", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const urls = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(urls).toContain(`${BASE_URL}/mentions-legales`);
    expect(urls.filter((url) => url.includes("/projets/"))).toHaveLength(7);
  });

  test("l'accueil décrit la personne pour les moteurs de recherche", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Ioamra Monchau — Développeur Full-Stack · Angular / NestJS",
    );
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd).toMatchObject({ "@type": "Person", name: "Ioamra Monchau" });
    expect(jsonLd.sameAs).toContain("https://github.com/ioamra");
  });

  test("les images générées sont servies", async ({ request }) => {
    for (const path of ["/opengraph-image", "/icon", "/apple-icon"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toBe("image/png");
    }
  });
});

test.describe("Sécurité", () => {
  test("le CV est servi en PDF, en téléchargement", async ({ request }) => {
    const response = await request.get("/cv");
    expect(response.headers()["content-type"]).toBe("application/pdf");
    expect(response.headers()["content-disposition"]).toBe(
      'attachment; filename="CV_Ioamra_Monchau.pdf"',
    );
  });

  test("/media n'expose que les images des projets", async ({ request }) => {
    for (const path of [
      "/media/cv/cv.pdf",
      "/media/..%2F.env",
      "/media/projects/..%2F..%2F.env",
      "/media/projects/inexistant.png",
    ]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("l'inscription d'un compte est désactivée", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      headers: { origin: BASE_URL },
      data: { email: "intrus@example.com", password: "Mot-de-passe-intrus", name: "Intrus" },
    });
    expect(response.ok()).toBe(false);
    expect((await response.json()).code).toBe("EMAIL_PASSWORD_SIGN_UP_DISABLED");
  });
});
