import { addDays, isSameDay, startOfWeek } from "date-fns";

/** The seven Date objects (Sun..Sat) for the week containing `reference`. */
export function weekDays(reference: Date = new Date()): Date[] {
  const start = startOfWeek(reference, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Events whose start falls on the given day. */
export function eventsOnDay<T extends { startsAt: Date }>(
  events: T[],
  day: Date,
): T[] {
  return events.filter((e) => isSameDay(e.startsAt, day));
}
