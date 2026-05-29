import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { createHousehold } from "@/lib/actions/household";
import { getCurrentUser, getHouseholdForUser } from "@/lib/session";
import { AddEventForm } from "@/components/AddEventForm";
import { AddPersonForm } from "@/components/AddPersonForm";
import { WeekView } from "@/components/WeekView";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const household = await getHouseholdForUser(user.id);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">plan-it</h1>
          {household && (
            <p className="text-sm text-gray-500">{household.name}</p>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{user.name ?? user.email}</span>
          <form action={logout}>
            <button type="submit" className="text-blue-600 underline">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {household ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-gray-700">This week</h2>
            <WeekView household={household} />
          </section>

          <aside className="flex flex-col gap-6">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Family ({household.persons.length})
              </h2>
              <ul className="mb-2 flex flex-wrap gap-2">
                {household.persons.map((p) => (
                  <li key={p.id} className="flex items-center gap-1 text-sm">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: p.color ?? "#6b7280" }}
                    />
                    {p.name}
                  </li>
                ))}
              </ul>
              <AddPersonForm />
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Add an event
              </h2>
              <AddEventForm persons={household.persons} />
            </div>
          </aside>
        </div>
      ) : (
        <section className="mx-auto max-w-sm rounded border border-gray-200 p-6">
          <h2 className="mb-1 text-lg font-semibold">Create your household</h2>
          <p className="mb-4 text-sm text-gray-500">
            A household is your shared family space. You can add the rest of the
            family next.
          </p>
          <form action={createHousehold} className="flex flex-col gap-3">
            <input
              name="name"
              required
              placeholder="e.g. The Smith Family"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-2 font-medium text-white"
            >
              Create household
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
