# Scheduling: conflicts, week view, dates

## Conflict detection — `src/lib/conflicts.ts`

Pure, dependency-free (deliberately — it's the most test-worthy code and the most
likely place for a subtle bug).

**v1 rule:** two **timed** events conflict when they (a) share ≥1 attendee Person AND
(b) overlap in time. All-day events don't time-conflict. Overlap test:
`a.startsAt < b.endsAt && b.startsAt < a.endsAt`.

- `findConflicts(events)` → `Conflict[]` ({eventA, eventB, personIds}).
- `conflictingEventIds(conflicts)` → `Set<id>` for quick UI lookup.

Verified (Playwright): overlapping events sharing a person → both flagged; overlapping
events with NO shared person → no conflict.

**The headline feature still to build (outline 3.3):** *coverage* conflicts — e.g. two
kids need rides at overlapping times but only one adult is free. That's a different
shape (it reasons about who can supervise/drive, not just attendee overlap) and is the
planned step-by-step feature demo.

## Week view — `src/components/WeekView.tsx`, `src/lib/week.ts`

`weekDays(ref)` returns Sun..Sat for the week containing `ref` (date-fns `startOfWeek`,
`weekStartsOn: 0`). `eventsOnDay` filters by `isSameDay(startsAt, day)`. Each event shows
time range + attendee color dots; conflict events get a red border + "⚠ conflict".

## Date handling (the load-bearing, bug-prone part)

- Event times stored as UTC `DateTime`.
- `createEvent` builds `new Date(\`${date}T${start}:00\`)` from the form's wall-clock
  date+time — this interprets in the **server's** local timezone. This is fine for a
  single-timezone family but is exactly where timezone/DST bugs will surface (the
  planned 3.4 bug + 3.5 debugging demos live here).
- The week view groups by `isSameDay`, also local-timezone sensitive.

## TODO / open
- Decide explicit timezone handling (per-household tz?) before multi-timezone families.
- All-day event semantics are stubbed (flag exists, no UI to create them yet).
