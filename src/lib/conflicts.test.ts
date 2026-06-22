// Unit tests for the pure conflict engine. Run with `npm test` (node --test).
// Node 22.18+ strips TS types and auto-detects ESM, so no test deps are needed.
import test from "node:test";
import assert from "node:assert/strict";
import {
  type EventForConflict,
  type PersonForCoverage,
  findConflicts,
  conflictingEventIds,
  findCoverageConflicts,
  coverageConflictEventIds,
  coverageReasonByEvent,
} from "./conflicts.ts";

// --- helpers -------------------------------------------------------------

let seq = 0;
function ev(
  start: string,
  end: string,
  personIds: string[],
  opts: { id?: string; allDay?: boolean } = {},
): EventForConflict {
  return {
    id: opts.id ?? `e${++seq}`,
    allDay: opts.allDay ?? false,
    startsAt: new Date(`2026-05-28T${start}:00`),
    endsAt: new Date(`2026-05-28T${end}:00`),
    attendees: personIds.map((personId) => ({ personId })),
  };
}

// Two adults (mom, dad), two kids (maya, sam).
const mom: PersonForCoverage = { id: "mom", canDrive: true };
const dad: PersonForCoverage = { id: "dad", canDrive: true };
const maya: PersonForCoverage = { id: "maya", canDrive: false };
const sam: PersonForCoverage = { id: "sam", canDrive: false };

// --- same-person double-booking (the existing v1 rule) -------------------

test("findConflicts: overlapping events sharing a person conflict", () => {
  const a = ev("16:00", "17:00", ["maya"], { id: "a" });
  const b = ev("16:30", "17:30", ["maya"], { id: "b" });
  const conflicts = findConflicts([a, b]);
  assert.equal(conflicts.length, 1);
  assert.deepEqual(conflicts[0].personIds, ["maya"]);
  assert.deepEqual([...conflictingEventIds(conflicts)].sort(), ["a", "b"]);
});

test("findConflicts: overlapping events with no shared person do not conflict", () => {
  const a = ev("16:00", "17:00", ["maya"]);
  const b = ev("16:30", "17:30", ["sam"]);
  assert.equal(findConflicts([a, b]).length, 0);
});

test("findConflicts: all-day events never time-conflict", () => {
  const a = ev("00:00", "23:59", ["maya"], { allDay: true });
  const b = ev("16:00", "17:00", ["maya"]);
  assert.equal(findConflicts([a, b]).length, 0);
});

// --- coverage conflicts (the headline feature) ---------------------------

test("headline: two overlapping kid pickups, only one driver → conflict", () => {
  // Maya soccer 16:00–17:00, Sam piano 16:15–17:15, dad is away → only mom free.
  const soccer = ev("16:00", "17:00", ["maya"], { id: "soccer" });
  const piano = ev("16:15", "17:15", ["sam"], { id: "piano" });
  const conflicts = findCoverageConflicts([soccer, piano], [mom, maya, sam]);
  assert.ok(conflicts.length >= 1, "expected a coverage conflict");
  const ids = coverageConflictEventIds(conflicts);
  assert.deepEqual([...ids].sort(), ["piano", "soccer"]);
  // During the overlap: demand 2, supply 1.
  const overlap = conflicts.find((c) => c.eventIds.length === 2);
  assert.ok(overlap, "expected a window with both events in demand");
  assert.equal(overlap!.demand, 2);
  assert.equal(overlap!.supply, 1);
});

test("two drivers cover two overlapping kid pickups → no conflict", () => {
  const soccer = ev("16:00", "17:00", ["maya"]);
  const piano = ev("16:15", "17:15", ["sam"]);
  assert.equal(findCoverageConflicts([soccer, piano], [mom, dad, maya, sam]).length, 0);
});

test("demand == supply (exactly enough drivers) → no conflict", () => {
  const soccer = ev("16:00", "17:00", ["maya"]);
  const piano = ev("16:15", "17:15", ["sam"]);
  // Two caregivers, two demands — exactly covered.
  assert.equal(findCoverageConflicts([soccer, piano], [mom, dad, maya, sam]).length, 0);
});

test("an accompanying caregiver means the event isn't demand", () => {
  // Mom is on the soccer event, so it's covered; only Sam's piano needs a driver,
  // and dad is free → no conflict.
  const soccer = ev("16:00", "17:00", ["maya", "mom"]);
  const piano = ev("16:15", "17:15", ["sam"]);
  assert.equal(findCoverageConflicts([soccer, piano], [mom, dad, maya, sam]).length, 0);
});

test("all-adult overlap → no coverage conflict (that's the double-booking rule's job)", () => {
  const meeting = ev("16:00", "17:00", ["mom"]);
  const gym = ev("16:15", "17:15", ["dad"]);
  assert.equal(findCoverageConflicts([meeting, gym], [mom, dad]).length, 0);
});

test("a caregiver busy with their own overlapping event reduces supply", () => {
  // Only mom can drive. She has her own meeting overlapping Sam's unaccompanied
  // piano → no one free for Sam.
  const meeting = ev("16:00", "17:00", ["mom"], { id: "meeting" });
  const piano = ev("16:15", "17:15", ["sam"], { id: "piano" });
  const conflicts = findCoverageConflicts([meeting, piano], [mom, maya, sam]);
  assert.deepEqual([...coverageConflictEventIds(conflicts)], ["piano"]);
});

test("non-overlapping kid pickups with one driver → no conflict", () => {
  const soccer = ev("15:00", "16:00", ["maya"]);
  const piano = ev("16:30", "17:30", ["sam"]);
  assert.equal(findCoverageConflicts([soccer, piano], [mom, maya, sam]).length, 0);
});

test("all-day kid events are excluded from coverage", () => {
  const campA = ev("00:00", "23:59", ["maya"], { allDay: true });
  const campB = ev("00:00", "23:59", ["sam"], { allDay: true });
  assert.equal(findCoverageConflicts([campA, campB], [mom, maya, sam]).length, 0);
});

test("coverageReasonByEvent produces a readable badge string", () => {
  const soccer = ev("16:00", "17:00", ["maya"], { id: "soccer" });
  const piano = ev("16:15", "17:15", ["sam"], { id: "piano" });
  const reasons = coverageReasonByEvent(
    findCoverageConflicts([soccer, piano], [mom, maya, sam]),
  );
  assert.equal(reasons.get("soccer"), "2 events need a driver, only 1 free");
  assert.equal(reasons.get("piano"), "2 events need a driver, only 1 free");
});
