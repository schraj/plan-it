// Conflict detection. Conflicts are derived from event overlaps and never
// stored. v1 rule: two timed events conflict when they share at least one
// attendee (Person) AND overlap in time. All-day events don't time-conflict.
//
// This is pure and dependency-free on purpose — it's the most testable and
// most likely-to-have-a-subtle-bug part of the app.

export type EventForConflict = {
  id: string;
  allDay: boolean;
  startsAt: Date;
  endsAt: Date;
  attendees: { personId: string }[];
};

export type Conflict = {
  eventA: string;
  eventB: string;
  /** Persons double-booked across the two events. */
  personIds: string[];
};

/** Two intervals overlap when each starts before the other ends. */
function overlaps(a: EventForConflict, b: EventForConflict): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

export function findConflicts(events: EventForConflict[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (a.allDay || b.allDay) continue;
      if (!overlaps(a, b)) continue;

      const aPeople = new Set(a.attendees.map((x) => x.personId));
      const shared = b.attendees
        .map((x) => x.personId)
        .filter((id) => aPeople.has(id));

      if (shared.length > 0) {
        conflicts.push({ eventA: a.id, eventB: b.id, personIds: shared });
      }
    }
  }

  return conflicts;
}

/** Flatten conflicts to the set of event ids involved, for quick UI lookup. */
export function conflictingEventIds(conflicts: Conflict[]): Set<string> {
  const ids = new Set<string>();
  for (const c of conflicts) {
    ids.add(c.eventA);
    ids.add(c.eventB);
  }
  return ids;
}

// ============================================================
// Coverage conflicts — the headline feature ("who can drive?").
//
// A *coverage* conflict is about supply vs. demand for caregivers, not bare
// attendee overlap. An event "needs coverage" when it has at least one dependent
// attendee and NO caregiver already attending (an unaccompanied kid). Over any
// overlapping window, it's a conflict when the number of events needing coverage
// exceeds the number of caregivers who aren't otherwise occupied.
//
// v1 simplification: this is an instantaneous supply/demand check evaluated per
// overlapping sub-interval (sweep line) — peak concurrency, not a full interval-
// assignment solver. It nails the headline case; exotic chained-overlap puzzles
// are out of scope for v1. Still pure and dependency-free.
// ============================================================

export type PersonForCoverage = { id: string; canDrive: boolean };

export type CoverageConflict = {
  /** Events left without a free caregiver during this window. */
  eventIds: string[];
  window: { start: Date; end: Date };
  /** Number of events needing coverage active in the window. */
  demand: number;
  /** Caregivers not otherwise occupied during the window. */
  supply: number;
};

/** An event needs coverage when it has a dependent attendee and no caregiver along. */
function needsCoverage(e: EventForConflict, caregiverIds: Set<string>): boolean {
  let hasDependent = false;
  for (const a of e.attendees) {
    if (caregiverIds.has(a.personId)) return false; // a caregiver is already with them
    hasDependent = true;
  }
  return hasDependent;
}

export function findCoverageConflicts(
  events: EventForConflict[],
  persons: PersonForCoverage[],
): CoverageConflict[] {
  const caregiverIds = new Set(persons.filter((p) => p.canDrive).map((p) => p.id));
  const totalCaregivers = caregiverIds.size;
  const timed = events.filter((e) => !e.allDay);

  // Sweep line: the active set only changes at an event start or end.
  const boundaries = new Set<number>();
  for (const e of timed) {
    boundaries.add(e.startsAt.getTime());
    boundaries.add(e.endsAt.getTime());
  }
  const points = [...boundaries].sort((a, b) => a - b);

  const conflicts: CoverageConflict[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const t0 = points[i];
    const t1 = points[i + 1];
    if (t1 <= t0) continue;

    // Events live across [t0, t1): started at or before t0, end strictly after t0.
    const active = timed.filter(
      (e) => e.startsAt.getTime() <= t0 && e.endsAt.getTime() > t0,
    );
    const demandEvents = active.filter((e) => needsCoverage(e, caregiverIds));
    if (demandEvents.length === 0) continue;

    // A caregiver is occupied if they attend any active event (their own
    // commitment or accompanying someone) — either way they can't cover a kid.
    const busy = new Set<string>();
    for (const e of active) {
      for (const a of e.attendees) {
        if (caregiverIds.has(a.personId)) busy.add(a.personId);
      }
    }
    const supply = totalCaregivers - busy.size;

    if (demandEvents.length > supply) {
      conflicts.push({
        eventIds: demandEvents.map((e) => e.id),
        window: { start: new Date(t0), end: new Date(t1) },
        demand: demandEvents.length,
        supply,
      });
    }
  }

  return conflicts;
}

/** Flatten coverage conflicts to the set of event ids involved, for quick UI lookup. */
export function coverageConflictEventIds(conflicts: CoverageConflict[]): Set<string> {
  const ids = new Set<string>();
  for (const c of conflicts) {
    for (const id of c.eventIds) ids.add(id);
  }
  return ids;
}

/**
 * Human-readable reason per event, for the week-view badge. When an event is
 * short on coverage across several windows, keep the worst (largest shortfall).
 */
export function coverageReasonByEvent(conflicts: CoverageConflict[]): Map<string, string> {
  const worst = new Map<string, CoverageConflict>();
  for (const c of conflicts) {
    for (const id of c.eventIds) {
      const cur = worst.get(id);
      if (!cur || c.demand - c.supply > cur.demand - cur.supply) worst.set(id, c);
    }
  }

  const reasons = new Map<string, string>();
  for (const [id, c] of worst) {
    const need = c.demand === 1 ? "1 event needs a driver" : `${c.demand} events need a driver`;
    reasons.set(id, `${need}, only ${c.supply} free`);
  }
  return reasons;
}
