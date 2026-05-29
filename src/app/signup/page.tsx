"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthState } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signup,
    undefined,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-gray-500">
          Then set up your household and start planning.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Your name"
          autoComplete="name"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password (8+ characters)"
          autoComplete="new-password"
          className="rounded border border-gray-300 px-3 py-2"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
