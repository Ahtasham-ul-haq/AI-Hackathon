"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/Loading";
import { deleteAccount, type SettingsState } from "./actions";

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(deleteAccount, undefined);

  return (
    <form action={action} className="mt-5 max-w-xl">
      <label htmlFor="delete-confirmation" className="block text-xs font-semibold uppercase tracking-wider text-rose-900">
        Type DELETE to confirm
      </label>
      <input
        id="delete-confirmation"
        name="confirmation"
        autoComplete="off"
        required
        className="mt-1.5 w-full rounded-sm border border-rose-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800"
      />
      {state?.error && (
        <p role="alert" className="mt-3 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-4 inline-flex items-center rounded-sm bg-rose-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-rose-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? (
          <span role="status" aria-live="polite" className="inline-flex items-center">
            <Spinner className="mr-2 h-3.5 w-3.5" />
            Deleting account…
          </span>
        ) : (
          "Delete my account"
        )}
      </button>
    </form>
  );
}
