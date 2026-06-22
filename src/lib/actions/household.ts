"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, getHouseholdForUser } from "@/lib/session";

const PERSON_COLORS = ["#2563eb", "#16a34a", "#db2777", "#ea580c", "#7c3aed", "#0891b2"];

function pickColor(index: number): string {
  return PERSON_COLORS[index % PERSON_COLORS.length];
}

/** Create the user's household and add them as the first (admin) Person. */
export async function createHousehold(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim() || "Our Household";

  await prisma.household.create({
    data: {
      name,
      memberships: { create: { userId: user.id, role: "ADMIN" } },
      persons: {
        // The person standing up the household is the adult — default them to a
        // caregiver so coverage detection works out of the box.
        create: {
          name: user.name ?? "Me",
          user: { connect: { id: user.id } },
          color: pickColor(0),
          canDrive: true,
        },
      },
    },
  });

  revalidatePath("/");
}

const personSchema = z.object({
  name: z.string().min(1),
  // Unchecked checkboxes are absent from FormData; "on" means checked.
  canDrive: z.preprocess((v) => v === "on", z.boolean()),
});

/** Add a schedulable person (e.g. a child with no login) to the household. */
export async function addPerson(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const household = await getHouseholdForUser(user.id);
  if (!household) throw new Error("No household");

  const parsed = personSchema.safeParse({
    name: formData.get("name"),
    canDrive: formData.get("canDrive"),
  });
  if (!parsed.success) return;

  await prisma.person.create({
    data: {
      name: parsed.data.name,
      canDrive: parsed.data.canDrive,
      householdId: household.id,
      color: pickColor(household.persons.length),
    },
  });

  revalidatePath("/");
}

const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

/** Create an event and attach the selected household members as attendees. */
export async function createEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const household = await getHouseholdForUser(user.id);
  if (!household) throw new Error("No household");

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
  });
  if (!parsed.success) return;

  // Only accept person ids that actually belong to this household.
  const allowed = new Set(household.persons.map((p) => p.id));
  const personIds = formData
    .getAll("personIds")
    .map(String)
    .filter((id) => allowed.has(id));
  if (personIds.length === 0) return;

  const { title, date, start, end } = parsed.data;
  const startsAt = new Date(`${date}T${start}:00`);
  const endsAt = new Date(`${date}T${end}:00`);

  await prisma.event.create({
    data: {
      title,
      startsAt,
      endsAt,
      householdId: household.id,
      attendees: { create: personIds.map((personId) => ({ personId })) },
    },
  });

  revalidatePath("/");
}
