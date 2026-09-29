import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

// Toutes les routes de Better Auth : /api/auth/sign-in/email, /api/auth/sign-out…
export const { GET, POST } = toNextJsHandler(auth);
