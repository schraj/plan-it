import { format } from "date-fns";
import {
  conflictingEventIds,
  coverageConflictEventIds,
  coverageReasonByEvent,
  findConflicts,
  findCoverageConflicts,
} from "@/lib/conflicts";
import type { Household } from "@/lib/session";
import { eventsOnDay, weekDays } from "@/lib/week";

export function WeekView({ household }: { household: Household }) {
  const days = weekDays();
  const conflictIds = conflictingEventIds(findConflicts(household.events));

  // Coverage conflicts (the headline feature): not enough free caregivers to
  // drive/supervise overlapping kid events. Surfaced distinctly from the red
  // same-person double-booking above.
  const coverageConflicts = findCoverageConflicts(household.events, household.persons);
  const coverageIds = coverageConflictEventIds(coverageConflicts);
  const coverageReasons = coverageReasonByEvent(coverageConflicts);

  const colorOf = new Map(
    household.persons.map((p) => [p.id, p.color ?? "#6b7280"]),
  );
  const nameOf = new Map(household.persons.map((p) => [p.id, p.name]));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const dayEvents = eventsOnDay(household.events, day);
        return (
          <div key={day.toISOString()} className="rounded border border-gray-200 p-2">
            <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
              {format(day, "EEE")}{" "}
              <span className="text-gray-400">{format(day, "d")}</span>
            </div>

            <div className="flex flex-col gap-2">
              {dayEvents.length === 0 && (
                <p className="text-xs text-gray-300">—</p>
              )}
              {dayEvents.map((event) => {
                const inConflict = conflictIds.has(event.id);
                const noCoverage = coverageIds.has(event.id);
                // Red double-booking takes visual precedence; amber otherwise.
                const cardClass = inConflict
                  ? "border-red-400 bg-red-50"
                  : noCoverage
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 bg-gray-50";
                return (
                  <div
                    key={event.id}
                    className={`rounded border p-2 text-xs ${cardClass}`}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-gray-500">
                      {format(event.startsAt, "HH:mm")}–
                      {format(event.endsAt, "HH:mm")}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {event.attendees.map((a) => (
                        <span
                          key={a.personId}
                          title={nameOf.get(a.personId) ?? ""}
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: colorOf.get(a.personId) }}
                        />
                      ))}
                    </div>
                    {inConflict && (
                      <div className="mt-1 font-medium text-red-600">
                        ⚠ conflict
                      </div>
                    )}
                    {noCoverage && (
                      <div className="mt-1">
                        <div className="font-medium text-amber-700">
                          ⚠ no driver free
                        </div>
                        <div className="text-amber-600">
                          {coverageReasons.get(event.id)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
