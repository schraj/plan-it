import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** The signed-in user (id/name/email) or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/**
 * The user's household with everything the dashboard needs. Scoped by the
 * user's membership, so a user can never load a household they don't belong
 * to — this is the core multi-tenant isolation guarantee.
 */
export async function getHouseholdForUser(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          persons: { orderBy: { name: "asc" } },
          events: {
            include: { attendees: true },
            orderBy: { startsAt: "asc" },
          },
        },
      },
    },
  });
  return membership?.household ?? null;
}

export type Household = NonNullable<Awaited<ReturnType<typeof getHouseholdForUser>>>;
