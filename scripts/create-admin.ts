/**
 * Crée le compte admin, ou change son mot de passe s'il existe déjà.
 *
 *   npm run admin:create -- <email> "<Nom affiché>"
 *
 * Le mot de passe est demandé dans le terminal (jamais passé en argument :
 * il resterait dans l'historique du shell).
 */
import "dotenv/config";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";

const [email, name = "Admin"] = process.argv.slice(2);
if (!email) {
  console.error('Usage : npm run admin:create -- <email> "<Nom affiché>"');
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Instance dédiée au script : l'inscription y est autorisée, contrairement au site.
const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.SITE_URL,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
});

/** Lit une ligne dans un terminal sans afficher les caractères saisis. */
function promptHidden(label: string) {
  return new Promise<string>((resolve, reject) => {
    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          return resolve(value);
        }
        if (char === "\u0003") return reject(new Error("Annulé.")); // Ctrl+C
        value = char === "\u007f" || char === "\b" ? value.slice(0, -1) : value + char;
      }
    };
    stdin.on("data", onData);
  });
}

async function askPassword() {
  let password: string;
  let confirmation: string;

  if (stdin.isTTY) {
    password = await promptHidden("Mot de passe (12 caractères minimum) : ");
    confirmation = await promptHidden("Confirmation : ");
  } else {
    // Entrée redirigée (pipe) : les lignes arrivent d'un bloc, on les lit une à une.
    const lines = createInterface({ input: stdin })[Symbol.asyncIterator]();
    password = (await lines.next()).value ?? "";
    confirmation = (await lines.next()).value ?? "";
  }

  if (password !== confirmation) throw new Error("Les mots de passe ne correspondent pas.");
  if (password.length < 12) throw new Error("Mot de passe trop court (12 caractères minimum).");
  return password;
}

async function main() {
  const password = await askPassword();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    const ctx = await auth.$context;
    await ctx.internalAdapter.updatePassword(existing.id, await ctx.password.hash(password));
    await db.session.deleteMany({ where: { userId: existing.id } });
    console.log(`Mot de passe de ${email} mis à jour (sessions existantes fermées).`);
    return;
  }

  if ((await db.user.count()) > 0) {
    throw new Error("Un compte admin existe déjà avec une autre adresse.");
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  console.log(`Compte admin créé : ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
