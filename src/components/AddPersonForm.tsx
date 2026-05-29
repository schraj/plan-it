import { addPerson } from "@/lib/actions/household";

export function AddPersonForm() {
  return (
    <form action={addPerson} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Add a family member"
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-gray-800 px-3 py-1 text-sm font-medium text-white"
        >
          Add
        </button>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-600">
        <input type="checkbox" name="canDrive" className="h-3.5 w-3.5" />
        Can drive / supervise
      </label>
    </form>
  );
}
