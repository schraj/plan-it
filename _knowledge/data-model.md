# Data model

Source of truth: `prisma/schema.prisma`. SQLite locally (Postgres-portable).

## Entities

- **User** — an authenticatable account (email + `passwordHash`). Auth.js owns this.
- **Household** — the tenant. Everything user-facing scopes to a household.
- **Membership** — User ↔ Household join with a `role` string (`"ADMIN"` | `"MEMBER"`).
  A User can belong to multiple households; a household has many users.
- **Person** — someone whose schedule is tracked. **This is NOT the same as a User.**
  Kids are managed Persons with `userId = null` (no login). People who log in link via
  `Person.userId` (unique, optional). This split is what lets us schedule and
  conflict-check family members who don't have accounts.
- **Event** — owned by a Household; `startsAt`/`endsAt` stored UTC; `allDay` flag.
- **EventAttendee** — Event ↔ Person many-to-many. Conflicts are derived from these.

## Why the User/Person split (the key decision)

A family planner has to schedule a 7-year-old who has no login. If "member" meant
"User", kids couldn't be attendees. So `Person` is the schedulable unit and `User` is
the auth unit, linked optionally. Cost: one extra hop (User → Membership → Household →
Person) but it's the realistic shape and makes the authz story honest.

## Tenancy / isolation

There is no global "current household" — always derive it from the signed-in user via
`getHouseholdForUser(userId)` (`src/lib/session.ts`). Never accept a householdId or
personId from the client without confirming it belongs to that user's household. See
the attendee filter in `createEvent` (`src/lib/actions/household.ts`) for the pattern.

## Gotchas

- SQLite has **no native enums** → `role` is a `String`.
- Prisma 7 needs a driver adapter; generated client is in `src/generated/prisma`
  (git-ignored). Run `npx prisma generate` after schema changes.

## TODO / open
- Migrate to Postgres for deploy.
- Indexes are minimal (`householdId`, `householdId+startsAt`); revisit when event volume grows.
