@AGENTS.md

# plan-it

A family schedule-sync app. One household, several people, one shared view of who's
doing what — with **conflict detection** as the headline feature (it warns when family
members are double-booked, and eventually when caregiving coverage is short).

This repo also doubles as a teaching vehicle for `outline.md` ("Claude in the Developer
Workflow"). Each build phase maps to a Section 3 workflow.

## Before you start a task

Read the relevant file in `/_knowledge` first, and update it after any conversation
that changes how an area works. The knowledge base is supposed to grow with the code.

- `_knowledge/data-model.md` — Prisma schema, the User/Person split, tenancy
- `_knowledge/auth.md` — Auth.js v5 setup, the edge/node split, route protection
- `_knowledge/scheduling.md` — conflict detection, week view, date handling
- `_knowledge/ui.md` — pages, components, server-action conventions

## Stack (and version gotchas)

- **Next.js 16** (App Router, Turbopack). NOTE: 16 has real breaking changes from
  older training data — e.g. the `middleware` convention is now **`proxy`** (`src/proxy.ts`,
  default-exported function). When unsure, read `node_modules/next/dist/docs/`.
- **React 19** — server components by default; `useActionState` for form state.
- **Auth.js (NextAuth v5 beta)** — Credentials provider + JWT sessions (DB sessions
  aren't supported with Credentials). Edge/node config split is mandatory (see auth.md).
- **Prisma 7 + SQLite** (local). Prisma 7 requires a **driver adapter**
  (`@prisma/adapter-better-sqlite3`); the generated client lives in `src/generated/prisma`
  and is git-ignored. SQLite has **no enums** — roles are strings.
- **Tailwind v4** (CSS-based config in `globals.css`, no `tailwind.config.js`).
- **date-fns** for date math. Event times are stored as UTC `DateTime`.

## Commands

- `npm run dev` — dev server (Turbopack) on :3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx prisma migrate dev --name <x>` — create+apply a migration
- `npx prisma generate` — regenerate the client (after schema edits)
- `node scripts/verify-golden-path.mjs` — Playwright end-to-end check (server must be up)

## Conventions

- Mutations are **server actions** in `src/lib/actions/`; they re-scope to the user's
  household and `revalidatePath("/")`.
- Every household-scoped query goes through `getHouseholdForUser(userId)` — never trust
  an id from the client without checking it belongs to the user's household (see the
  attendee filter in `createEvent`). This is the core tenant-isolation rule.
- Keep `conflicts.ts` pure and dependency-free; it's the most test-worthy code.

## Not yet built (deliberate v1 non-goals)

Recurring events, notifications, mobile, chores/lists, OAuth login. Don't add these
without a decision — they're held back as future-feature demos.
