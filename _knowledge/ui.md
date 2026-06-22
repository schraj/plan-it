# UI: pages, components, server actions

Plain Tailwind v4 (no component library yet — shadcn/ui is a candidate later).

## Pages (`src/app`)

- `login/page.tsx`, `signup/page.tsx` — client components using `useActionState` against
  the auth server actions, so they can show inline error messages.
- `page.tsx` — the dashboard (server component). Redirects to `/login` if no user.
  If the user has no household, renders the "Create your household" form; otherwise
  renders the week view + sidebar (family list, add-person, add-event).
- `layout.tsx` — root layout, fonts + metadata.

## Components (`src/components`)

- `WeekView` — server component; takes the `Household` and renders the 7-day grid with
  conflict highlighting. Two distinct signals: **red border + "⚠ conflict"** for same-person
  double-booking, and **amber border + "⚠ no driver free"** (plus a reason line) for coverage
  conflicts. Red takes visual precedence when an event hits both.
- `AddPersonForm`, `AddEventForm` — plain `<form action={serverAction}>` (progressive
  enhancement; no client JS needed). `AddEventForm` lists household persons as checkboxes
  named `personIds`. `AddPersonForm` has a "can drive / supervise" checkbox named `canDrive`
  (drives coverage detection; unchecked = a dependent/kid).

## Server actions (`src/lib/actions`)

- `auth.ts` — `signup`, `login`, `logout`. `signup`/`login` use `useActionState`'s
  `(prevState, formData)` signature and return `{ error }`. **`signIn` throws a redirect
  on success — never swallow it**; only catch `AuthError` (bad creds) and rethrow the rest.
- `household.ts` — `createHousehold`, `addPerson`, `createEvent`. All re-derive the
  household from the signed-in user and `revalidatePath("/")`. `createEvent` filters
  submitted `personIds` to those actually in the household (tenant isolation).

## Conventions
- Validate inputs with zod at the action boundary.
- Forms post to server actions; reads happen in server components via `src/lib/session.ts`.

## TODO / open
- No edit/delete for people or events yet (create-only).
- No loading/pending UI on the dashboard forms (only login/signup show pending state).
- Consider shadcn/ui once the surface grows.
