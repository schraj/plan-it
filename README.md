# claude-dev-workflow

A hands-on lab for the **Claude Code development process**. The point of this repo
isn't the app — it's the *workflow*: how you drive Claude through greenfield setup,
feature building, bug fixing, debugging, code review, and documentation as a senior
engineer who guides and verifies, rather than a passenger.

The full narrative lives in [`outline.md`](outline.md) ("Claude in the Developer
Workflow" — blog post + workshop). This repo is its worked example: a real
multi-user app, built phase by phase, where each phase *demonstrates* one of the
Section 3 workflows so you can read the prose and then see it land in actual commits,
knowledge docs, and plans.

## How to use this repo

1. **Read [`outline.md`](outline.md)** — the mindset (Section 1), setup (Section 2),
   and the core workflows (Section 3).
2. **Read [`CLAUDE.md`](CLAUDE.md)** — the development process is documented at the
   top, followed by the project's own conventions. This is the "persistent project
   brain" pattern in action.
3. **Walk the phased commits** — each maps to a workflow (table below). Check out a
   phase, read the diff, then read the matching `outline.md` section.
4. **Replay a workflow yourself** — reset to a phase and try driving Claude through
   it. Compare what you get to what's committed.
5. **Watch the artifacts** — [`_knowledge/`](_knowledge/) (the growing knowledge base),
   [`tasks/todo.md`](tasks/todo.md) (planning), and [`tasks/lessons.md`](tasks/lessons.md)
   (the self-improvement loop) are the workflow's outputs, not afterthoughts.

### Global setup: `Global-claude.md`

[`Global-claude.md`](Global-claude.md) is a portable, project-agnostic Claude Code
config (Boris Cherny's global `CLAUDE.md` — workflow orchestration, task management,
and core principles). It isn't read by this repo; it's meant for *your* global config.
Copy its contents into your developer-level instructions at `~/.claude/CLAUDE.md` so
the same workflow defaults apply across all your projects.

## Workflow → where to see it

| Workflow (`outline.md` §3) | Where it shows up in this repo |
|---|---|
| Starting a new project (3.1) | The scaffold commit: stack chosen deliberately, `CLAUDE.md` + `_knowledge/` stood up on day one |
| Working on an existing repo (3.2) | The `_knowledge/` files — orientation captured and grown per area |
| Feature building (3.3) | The coverage-conflict engine phase — spec → plan → step-by-step implement → verify |
| Bug fixing (3.4) | Timezone / all-day-event date bugs (see `tasks/`) |
| Debugging (3.5) | Conflicts missed across a DST boundary |
| Code review (3.6) | Household-isolation / tenant-authz review |
| Documentation & planning (3.7) | `_knowledge/auth.md` and the auth + isolation write-ups |

## The specimen: `plan-it`

The app under the microscope is **plan-it** — a family schedule-sync app. One
household, several people, one shared view of who's doing what, with **conflict
detection** as the headline feature: it warns when family members are double-booked,
and when caregiving coverage is short ("two kids, one car, overlapping pickups").
It's a real app on purpose — a genuine multi-user product generates the auth,
tenancy, date-math, and authz problems that make the workflow demos authentic.

**Stack:** Next.js 16 (App Router) · React 19 · Auth.js v5 (Credentials + JWT) ·
Prisma 7 + SQLite · Tailwind v4 · date-fns.

## Running the specimen

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
