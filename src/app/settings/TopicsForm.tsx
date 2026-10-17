"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/Loading";
import { TopicPicker } from "@/components/TopicPicker";
import { saveTopics, type SettingsState } from "./actions";

export function TopicsForm({ topics, subtopics }: { topics: string[]; subtopics: string[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveTopics, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TopicPicker initialTopics={topics} initialSubtopics={subtopics} />
      {state?.error && (
        <div className="rounded-xs border border-red-300 bg-red-50 p-2.5 text-xs text-red-800">
          {state.error}
        </div>
      )}
      {state?.message && (
        <div className="rounded-xs border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
          {state.message}
        </div>
      )}
      <button
        disabled={pending}
        aria-busy={pending}
        className="self-start rounded-xs bg-stone-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-stone-800 hover:shadow-md active:scale-98 disabled:opacity-50"
      >
        {pending ? (
          <span role="status" aria-live="polite" className="inline-flex items-center">
            <Spinner className="mr-2 h-3.5 w-3.5" />
            Saving your topics…
          </span>
        ) : (
          "Save topics"
        )}
      </button>
    </form>
  );
}
