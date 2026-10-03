import { defineConfig, devices } from "@playwright/test";
import { ADMIN_STORAGE_STATE, BASE_URL, TEST_ENV, TEST_PORT } from "./e2e/config";

/**
 * Tests end-to-end sur un build de production, branché sur la base de test.
 * Lancement : npm run test:e2e (Docker doit tourner : db-test et mailpit).
 */
export default defineConfig({
  testDir: "./e2e",
  // Les tests partagent une base : exécution séquentielle, ordre déterministe.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // 1. Pages publiques, sur le contenu du seed.
    {
      name: "public",
      testIgnore: /admin\//,
      use: { ...devices["Desktop Chrome"] },
    },
    // 2. Connexion admin, enregistrée pour les tests suivants.
    {
      name: "admin-setup",
      testMatch: /admin\/auth\.setup\.ts/,
      dependencies: ["public"],
    },
    // 3. Back-office : après les tests publics, car il modifie le contenu.
    {
      name: "admin",
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ["admin-setup"],
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_STORAGE_STATE },
    },
  ],
  webServer: {
    // Base remise à zéro et seedée, puis build et démarrage sur la base de test.
    command: `npx tsx e2e/prepare.ts && npx next build && npx next start -p ${TEST_PORT}`,
    url: BASE_URL,
    env: TEST_ENV,
    // Toujours un serveur neuf : un serveur réutilisé aurait une base déjà modifiée.
    reuseExistingServer: false,
    timeout: 240_000,
    stdout: "pipe",
  },
});
