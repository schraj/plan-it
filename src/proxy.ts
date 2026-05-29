import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next 16 renamed the `middleware` convention to `proxy`. Auth.js's `auth`
// returns a request-handling function, which we export as the default proxy.
// Runs on the edge runtime, so it uses only the edge-safe authConfig (no
// Prisma, no bcrypt); the `authorized` callback there decides access.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
