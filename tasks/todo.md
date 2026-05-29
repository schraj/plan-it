# plan-it — Project Plan

> Status: **Concept locked, awaiting greenlight to scaffold.** No code written yet.

## What we're building

**plan-it** — a family schedule-sync app. One household, several people, one shared
view of who's doing what, so nothing collides and nobody's double-booked.

**The distinctive feature (not in a plain shared calendar):** *conflict detection.*
The app overlays everyone's schedules and warns when things clash — starting with
"this person is double-booked," and culminating in the headline case:

> "Maya has soccer at 4:00 and Sam has piano at 4:15 — and only one parent is free to drive."

That coverage conflict ("two kids, one car, overlapping pickups") is the feature
families actually need and a generic calendar misses.

## Why this app (its second job: teaching vehicle)

This repo also demonstrates the Section 3 Claude-Code workflows from `outline.md`.
A real multi-user app generates those demo moments naturally:

| Workflow | Demo moment in plan-it |
|---|---|
| Greenfield (3.1) | Scaffold + auth + the sign-up → shared-week vertical slice |
| Feature (3.3) | The coverage-conflict engine + warnings in the week view |
| Bug (3.4) | "All-day events render on the wrong day in some timezones" |
| Debugging (3.5) | "Conflicts intermittently missed across a DST boundary" |
| Code review (3.6) | Real authz review — household isolation, member permissions |
| Docs (3.7) | Document the auth + household-isolation model |

## Stack (decided)

- **Next.js** (App Router) + **TypeScript**
- **Auth.js (NextAuth v5)** — email/password to start; Prisma adapter
- **Prisma + SQLite** for local dev (schema kept Postgres-portable for later deploy).
  Note: SQLite has no native enums, so role lives as a `String` (`"ADMIN"`/`"MEMBER"`).
- **Tailwind CSS** + **shadcn/ui** for components (conventional, fast, readable)
- **date-fns** for date math — timezone handling kept explicit (it's load-bearing here)

## Data model (v1 sketch — to refine in Plan mode before coding)

- **User** — an authenticatable account (has a login)
- **Household** — the tenant; everything scopes to it
- **Membership** — User ↔ Household + role (`ADMIN` | `MEMBER`)
- **Person** — someone whose schedule is tracked. May link to a `User` (people who
  log in) or be *managed* (kids with no login). This User/Person split is what makes
  conflict detection work — kids are schedulable entities even without accounts.
- **Event** — belongs to a Household; has start, end, title
- **EventAttendee** — Event ↔ Person (many-to-many)
- **Conflict** — *derived, never stored.* Computed when a Person has overlapping
  events (v1 core), and later when caregiving coverage is short (the 3.3 feature).

## v1 vertical slice (3.1 discipline: thin, end-to-end, deployable)

sign up → create a household → add a couple of people → add events → see the shared
week view with basic same-person overlap warnings. One capability wired through every
layer before broadening.

## Build phases (each maps to a workflow demo)

1. **Greenfield setup** — scaffold Next.js+TS+Tailwind; Prisma+Postgres; Auth.js;
   generate initial `CLAUDE.md`; stub `/_knowledge` (auth, data-model, scheduling,
   ui). *Day-one knowledge artifacts per 3.1.*
2. **Vertical slice** — auth flow + household/person CRUD + event CRUD + week view +
   same-person overlap warning. End-to-end before broadening.
3. **Headline feature (3.3 demo)** — coverage-conflict engine ("who can drive?"),
   built in commit-sized steps with tests.
4. **Seeded bug + fix (3.4 demo)** — introduce/fix the timezone all-day-event bug.
5. **Seeded debugging (3.5 demo)** — the DST-boundary missed-conflict mystery.
6. **Review + docs (3.6 / 3.7 demos)** — authz/isolation review; document the model.

## Explicit non-goals for v1

- No recurring events
- No notifications / reminders
- No native mobile
- No chores / lists / meal planning
- No social login (email/password only to start)

*(All of these are deliberately held back as great "next feature" demos later.)*

## Decisions (resolved)

- ✅ **User vs. Person split: YES.** A User is a login; a Person is a schedulable
  household member. Kids are managed Persons with no User. Person may optionally link
  to a User for those who log in.
- ✅ **SQLite for local dev** (Postgres-portable schema).

## Decisions (resolved, cont.)

- ✅ **`_knowledge/` is committed in-repo** (this is a teaching repo — the audience
  should see the knowledge base). Not mirroring the 3.2 "outside source control" pattern.

## Open decisions (defer to when relevant)

- Exact **conflict semantics** for v1 core vs. the 3.3 coverage feature.

## Progress

- [x] **Phase 1 — Greenfield setup** (scaffold, DB, auth, day-one knowledge artifacts)
- [x] **Phase 2 — Vertical slice** (auth → household → person → event → week view +
      same-person conflict warning). Verified end-to-end in a browser.
- [ ] Phase 3 — Headline feature: coverage-conflict engine (3.3 demo)
- [ ] Phase 4 — Seeded timezone bug + fix (3.4 demo)
- [ ] Phase 5 — Seeded DST debugging mystery (3.5 demo)
- [ ] Phase 6 — Review + docs (3.6 / 3.7 demos)

## Review — Phases 1 & 2 (greenfield setup + vertical slice)

**What shipped:** A working, multi-user family planner. Sign up → create household →
add people (incl. login-less kids) → add events → shared week view that flags
same-person double-bookings in red.

**Stack as built:** Next.js 16.2 (App Router, Turbopack) · React 19 · Auth.js v5 beta
(Credentials + JWT, edge/node split) · Prisma 7 + SQLite (better-sqlite3 driver adapter)
· Tailwind v4 · date-fns. CLAUDE.md + `_knowledge/{data-model,auth,scheduling,ui}.md`
seeded on day one.

**Version surprises handled (the "Next 16 ≠ training data" moments):**
- `middleware` → **`proxy`** convention (Next 16). Renamed `src/middleware.ts` →
  `src/proxy.ts` with a default function export, per bundled docs.
- **Prisma 7** requires a driver adapter and generates the client to `src/generated/prisma`.
- Read `node_modules/next/dist/docs/` to confirm conventions rather than guess.

**Verification (browser, Playwright — not just typecheck):**
- ✅ Golden path: signup → household → add Maya → two overlapping Maya events → both
  show **⚠ conflict**. Screenshot: `/tmp/plan-it-verify.png`.
- 🔍 Probe: two overlapping events with **no shared attendee** → **0 conflicts**
  (detector keys on shared person, not bare time overlap). `/tmp/plan-it-probe.png`.
- ✅ Unauth `/` → 307 redirect to `/login` (proxy gate). `/login`,`/signup` → 200.
- tsc + lint clean.

**Notes / debts:** create-only (no edit/delete yet); date handling is local-tz and is
the intended home of the upcoming bug/debug demos.

## Restarting a session here

Fresh session is auto-oriented: `CLAUDE.md` loads on start and points at `_knowledge/`
and this file. To run locally:
1. `npm install`
2. `npx prisma generate` (client is git-ignored) and `npx prisma migrate dev` if no `dev.db`
3. Ensure `.env` has `AUTH_SECRET` (git-ignored — regenerate with `npx auth secret` or
   `openssl rand -base64 33`) and `DATABASE_URL="file:./dev.db"`
4. `npm run dev` → http://localhost:3000
5. Verify with `node scripts/verify-golden-path.mjs` (server must be running)

**Next up: Phase 3** — coverage-conflict engine ("two kids, overlapping pickups, one
free parent"), built step-by-step with tests (the §3.3 feature-building demo).
