"use client";

import { useActionState } from "react";
import { TopicPicker } from "@/components/TopicPicker";
import { Spinner, useRotatingMessage } from "@/components/Loading";
import { completeOnboarding, type OnboardingState } from "./actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(completeOnboarding, undefined);
  const step = useRotatingMessage(
    ["Saving your topics…", "Understanding what you like…", "Starting your first paper…"],
    pending,
    2000,
  );

  return (
    <form
      action={(fd: FormData) => {
        fd.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        return action(fd);
      }}
      className="flex flex-col gap-8"
    >
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">Choose your topics</h2>
          <span className="text-xs text-stone-500">Tap card to expand subtopics</span>
        </div>
        <p className="mt-1 text-xs text-stone-600">
          Pick at least one topic. You can add or remove these anytime from Settings.
        </p>
        <div className="mt-4">
          <TopicPicker />
        </div>
      </section>

      <section className="border-t border-stone-200 pt-6">
        <label htmlFor="note" className="block font-serif text-lg font-bold text-stone-900">
          Anything specific?{" "}
          <span className="text-xs font-sans font-normal text-stone-500">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-stone-600">
          Write one sentence in plain English. Our editor converts it into fine-grained starting weights.
        </p>
        <div className="mt-2.5">
          <input
            id="note"
            name="note"
            maxLength={300}
            placeholder='e.g. "I follow Pakistani cricket, renewable energy grids, and open-source AI startups."'
            className="w-full rounded-sm border border-stone-300 bg-[#fdfbf7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-stone-900 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          />
        </div>
      </section>

      {state?.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          {state.error}
        </div>
      )}

      <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center justify-center rounded-xs bg-stone-900 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-xs transition hover:bg-stone-800 hover:shadow-md active:scale-98 disabled:opacity-50"
        >
          {pending ? (
            <span role="status" aria-live="polite" className="inline-flex items-center">
              <Spinner className="mr-2 h-4 w-4" />
              {step}
            </span>
          ) : (
            "Make my first paper →"
          )}
        </button>

        <span className="text-xs text-stone-500">
          Your interests can be changed anytime in Settings.
        </span>
      </div>
    </form>
  );
}
