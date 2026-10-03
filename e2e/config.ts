/** Constantes partagées par la configuration Playwright, la préparation et les tests. */

export const TEST_PORT = 3200;
export const BASE_URL = `http://localhost:${TEST_PORT}`;
export const MAILPIT_URL = "http://localhost:8025";

/** Compte admin créé par e2e/prepare.ts dans la base de test uniquement. */
export const ADMIN = {
  email: "admin@e2e.test",
  password: "Mot-de-passe-E2E-2026",
  name: "Admin E2E",
};

/** Session admin enregistrée par admin/auth.setup.ts et réutilisée par les tests admin. */
export const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";

/**
 * Environnement du serveur testé : base de test (docker-compose : db-test), stockage
 * séparé, Mailpit. Il remplace les valeurs du .env pour le build et le serveur.
 */
export const TEST_ENV = {
  DATABASE_URL: "postgresql://portfolio:portfolio@localhost:5433/portfolio_test",
  SITE_URL: BASE_URL,
  STORAGE_DIR: "storage-test",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_USER: "",
  SMTP_PASSWORD: "",
  MAIL_FROM: "Portfolio E2E <no-reply@e2e.test>",
  MAIL_TO: "proprietaire@e2e.test",
  BETTER_AUTH_SECRET: "secret-de-test-e2e-uniquement-0123456789",
};
