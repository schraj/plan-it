import { addPerson } from "@/lib/actions/household";

export function AddPersonForm() {
  return (
    <form action={addPerson} className="flex gap-2">
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
    </form>
  );
}
