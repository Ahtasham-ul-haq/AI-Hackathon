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
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-800">{state.message}</p>}
      <button disabled={pending} aria-busy={pending}
        className="self-start rounded bg-stone-900 px-5 py-2 text-white hover:bg-stone-700 disabled:opacity-50">
        {pending ? <span role="status" aria-live="polite"><Spinner className="mr-2 h-3.5 w-3.5" />Saving your topics…</span> : "Save topics"}
      </button>
    </form>
  );
}
