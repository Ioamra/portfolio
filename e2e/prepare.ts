/**
 * Prépare l'environnement de test, avant le build du serveur testé :
 * base de test remise à zéro + migrations + seed, stockage avec un CV factice,
 * compte admin de test. Lancé par la commande webServer de playwright.config.ts.
 */
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { ADMIN, TEST_ENV } from "./config";

// Garde-fou : ce script efface la base. Il refuse toute autre base que celle de test.
if (!process.env.DATABASE_URL?.endsWith("/portfolio_test")) {
  throw new Error(`Base de test attendue, reçu : ${process.env.DATABASE_URL ?? "(vide)"}`);
}

const env = { ...process.env, ...TEST_ENV };
const run = (command: string, input?: string) =>
  execSync(command, { env, input, stdio: [input ? "pipe" : "inherit", "inherit", "inherit"] });

console.log("[e2e] Remise à zéro de la base de test…");
run("npx prisma migrate reset --force");

console.log("[e2e] Stockage de test…");
rmSync(TEST_ENV.STORAGE_DIR, { recursive: true, force: true });
mkdirSync(path.join(TEST_ENV.STORAGE_DIR, "cv"), { recursive: true });
copyFileSync("e2e/fixtures/cv-test.pdf", path.join(TEST_ENV.STORAGE_DIR, "cv", "cv.pdf"));

console.log("[e2e] Seed…");
run("npx prisma db seed");

console.log("[e2e] Compte admin de test…");
run(
  `npx tsx scripts/create-admin.ts ${ADMIN.email} "${ADMIN.name}"`,
  `${ADMIN.password}\n${ADMIN.password}\n`,
);
