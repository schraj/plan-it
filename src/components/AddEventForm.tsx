import { format } from "date-fns";
import { createEvent } from "@/lib/actions/household";

type PersonOption = { id: string; name: string; color: string | null };

export function AddEventForm({ persons }: { persons: PersonOption[] }) {
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={createEvent} className="flex flex-col gap-2">
      <input
        name="title"
        required
        placeholder="Event title (e.g. Soccer practice)"
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <input
          type="date"
          name="date"
          defaultValue={today}
          required
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          type="time"
          name="start"
          defaultValue="16:00"
          required
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          type="time"
          name="end"
          defaultValue="17:00"
          required
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-1 text-xs text-gray-500">Who&apos;s involved?</legend>
        {persons.map((p) => (
          <label key={p.id} className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="personIds" value={p.id} />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: p.color ?? "#6b7280" }}
            />
            {p.name}
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white"
      >
        Add event
      </button>
    </form>
  );
}
