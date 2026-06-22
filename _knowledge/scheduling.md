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

## Coverage detection — also in `src/lib/conflicts.ts` (the headline feature)

A *coverage* conflict reasons about **supply vs. demand for caregivers**, not bare
attendee overlap. Driven by `Person.canDrive` (see `data-model.md`).

- An event **needs coverage** when it has ≥1 dependent attendee (a non-`canDrive` Person)
  AND **no** caregiver already attending (an unaccompanied kid). If an adult is on the
  event, it's covered — but that adult is now occupied.
- A caregiver is **occupied** during any event they attend (own commitment or accompanying).
- Over any overlapping window: conflict when `#events-needing-coverage > #free-caregivers`.

API (all pure): `findCoverageConflicts(events, persons)` → `CoverageConflict[]`
(`{eventIds, window, demand, supply}`); `coverageConflictEventIds(cs)` → `Set<id>`;
`coverageReasonByEvent(cs)` → `Map<id, string>` for the week-view badge.

**v1 simplification (intentional):** it's a sweep-line, per-sub-interval *peak-concurrency*
check, not a full interval-assignment solver. Nails the headline ("two kids, one car,
overlapping pickups"); exotic chained-overlap puzzles are out of v1 scope.

Tested in `src/lib/conflicts.test.ts` (`node --test`, run via `npm test` — zero deps,
Node 22.18+ strips TS types). Covers the headline, accompanied-dependent, demand==supply,
busy-caregiver, all-adult, all-day, and non-overlap cases.

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
