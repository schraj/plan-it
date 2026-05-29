# Auth

Auth.js (NextAuth v5 beta) with a Credentials provider and JWT sessions.

## Files

- `src/auth.config.ts` — **edge-safe** base config. Imports NOTHING Node-only (no
  Prisma, no bcrypt). Holds `pages.signIn` and the `authorized` callback that gates
  routes. This is the only config the proxy/middleware imports.
- `src/lib/auth.ts` — **full** config (Node runtime). Spreads `authConfig`, adds the
  Prisma adapter, the Credentials provider (bcrypt compare), and the jwt/session
  callbacks that put `user.id` on the session. Exports `handlers`, `auth`, `signIn`,
  `signOut`.
- `src/app/api/auth/[...nextauth]/route.ts` — re-exports `handlers` as GET/POST.
- `src/proxy.ts` — Next 16's renamed middleware. Default-exports `NextAuth(authConfig).auth`.
- `src/types/next-auth.d.ts` — augments Session/JWT with `id`.

## The edge/node split (don't collapse it)

Middleware/proxy runs on the **edge runtime**, where Prisma (native better-sqlite3) and
bcrypt can't run. So the providers/adapter live only in `src/lib/auth.ts`, and the proxy
imports the bare `authConfig`. Putting Credentials/Prisma into authConfig will break the
edge build. This split is the canonical Auth.js v5 + Prisma + middleware pattern.

## Why JWT sessions

The Credentials provider does not support database sessions, so
`session: { strategy: "jwt" }` is required. The Prisma adapter is still wired up for
future OAuth providers (the Account/Session/VerificationToken models exist for that).

## Route protection

`authorized` in `authConfig`: everything is private except `/login` and `/signup`.
Signed-in users hitting an auth page get bounced to `/`. The proxy `matcher` excludes
`api`, `_next/*`, and `favicon.ico`.

## Passwords

`User.passwordHash` via `bcryptjs` (pure JS, no native build). Signup hashes; the
Credentials `authorize` compares. Min length enforced with zod in both the signup action
and the provider.

## Env
- `AUTH_SECRET` (generated, in `.env`). `DATABASE_URL` for Prisma.

## TODO / open
- Email verification flow is unused (`emailVerified` exists but nothing sets it).
- Add OAuth provider(s) — models are ready.
