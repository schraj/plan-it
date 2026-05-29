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
