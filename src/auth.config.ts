import type { NextAuthConfig } from "next-auth";

// Edge-safe base config. This is the ONLY auth config the middleware imports,
// so it must not pull in Prisma, bcrypt, or any Node-only API. The full config
// (adapter + Credentials provider) lives in src/lib/auth.ts and is used by the
// route handler / server actions, which run on the Node runtime.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // real providers are added in src/lib/auth.ts
  callbacks: {
    // Route protection. Everything is private except the auth pages.
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isAuthPage = path === "/login" || path === "/signup";

      if (isAuthPage) {
        // Signed-in users shouldn't see login/signup — bounce to the app.
        if (loggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      // Protect every other page; false triggers a redirect to signIn.
      return loggedIn;
    },
  },
} satisfies NextAuthConfig;
