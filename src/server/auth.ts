import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { env } from "./env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Un seul compte admin, créé en ligne de commande (npm run admin:create).
    disableSignUp: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // prolongée au plus une fois par jour
  },
  rateLimit: {
    enabled: true,
    // 5 tentatives de connexion par minute et par IP.
    customRules: { "/sign-in/email": { window: 60, max: 5 } },
  },
  advanced: {
    // Derrière Cloudflare Tunnel, l'IP réelle du visiteur est dans cf-connecting-ip.
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
  },
  // Permet aux Server Actions de poser les cookies de session.
  plugins: [nextCookies()],
});
