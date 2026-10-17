"use client";

import { useActionState } from "react";
import { TopicPicker } from "@/components/TopicPicker";
import { completeOnboarding, type OnboardingState } from "./actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(completeOnboarding, undefined);
  return (
    <form
      action={(fd: FormData) => {
        fd.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        return action(fd);
      }}
      className="mt-8 flex flex-col gap-8"
    >
      <section>
        <h2 className="font-semibold">Pick your topics</h2>
        <p className="text-sm text-stone-600">Tap a topic to narrow it down with subtopics (optional).</p>
        <div className="mt-4">
          <TopicPicker />
        </div>
      </section>
      <section>
        <label htmlFor="note" className="font-semibold">Anything else? <span className="font-normal text-stone-500">(optional)</span></label>
        <p className="text-sm text-stone-600">One sentence, e.g. &ldquo;I follow Pakistani cricket and AI startups.&rdquo;</p>
        <input id="note" name="note" maxLength={300}
          className="mt-2 w-full rounded border border-stone-300 bg-white px-3 py-2" />
      </section>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending}
        className="self-start rounded bg-stone-900 px-6 py-2.5 text-white hover:bg-stone-700 disabled:opacity-50">
        {pending ? "Setting up your paper…" : "Make my first paper"}
      </button>
    </form>
  );
}
