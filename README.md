# plan-it

A family schedule-sync app. One household, several people, one shared view of who's
doing what — with **conflict detection** that warns when family members are
double-booked.

This repo also doubles as a worked example for `outline.md` ("Claude in the Developer
Workflow"): each build phase demonstrates one of the Section 3 Claude-Code workflows.
The plan and progress live in [`tasks/todo.md`](tasks/todo.md); area docs live in
[`_knowledge/`](_knowledge/); conventions and stack gotchas live in
[`CLAUDE.md`](CLAUDE.md).

## Stack

Next.js 16 (App Router) · React 19 · Auth.js v5 (Credentials + JWT) · Prisma 7 + SQLite
· Tailwind v4 · date-fns.

## Local setup

```bash
npm install
npx prisma generate          # generated client is git-ignored
npx prisma migrate dev       # creates ./dev.db if missing

# .env (git-ignored) needs:
#   DATABASE_URL="file:./dev.db"
#   AUTH_SECRET="<openssl rand -base64 33>"

npm run dev                  # http://localhost:3000
```

Sign up with any email/password (8+ chars), create a household, add family members
(kids don't need logins), and add events. Overlapping events that share a person are
flagged in red.

## Useful commands

| Command | What |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `npx prisma migrate dev --name <x>` | Create + apply a migration |
| `node scripts/verify-golden-path.mjs` | Playwright end-to-end check (server must be up) |
