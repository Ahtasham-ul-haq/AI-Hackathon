"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/Loading";
import { savePreferences, type SettingsState } from "./actions";
import { LANGUAGES, REGIONS } from "@/lib/preferences";

type Prefs = {
  region: string | null;
  language: string;
  preferred_sources: string[];
  avoided_sources: string[];
  length: "short" | "standard" | "long";
};

const field = "mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2";

export function PreferencesForm({ prefs }: { prefs: Prefs }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(savePreferences, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Region
        <select name="region" defaultValue={prefs.region ?? ""} className={field}>
          {REGIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">
        Language
        <select name="language" defaultValue={prefs.language} className={field}>
          {LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">
        Preferred sources <span className="font-normal text-stone-500">(comma separated)</span>
        <input name="preferred" defaultValue={prefs.preferred_sources.join(", ")} placeholder="e.g. BBC News, Dawn" className={field} />
      </label>
      <label className="text-sm font-medium">
        Sources to avoid <span className="font-normal text-stone-500">(comma separated)</span>
        <input name="avoided" defaultValue={prefs.avoided_sources.join(", ")} placeholder="e.g. TechCrunch" className={field} />
      </label>
      <label className="text-sm font-medium">
        Paper length
        <select name="length" defaultValue={prefs.length} className={field}>
          <option value="short">Short (10-12 stories)</option>
          <option value="standard">Standard (15-20 stories)</option>
          <option value="long">Long (22-25 stories)</option>
        </select>
      </label>
      <div className="flex flex-col justify-end gap-2 sm:col-span-2">
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state?.message && <p className="text-sm text-green-800">{state.message}</p>}
        <button disabled={pending} aria-busy={pending}
          className="self-start rounded bg-stone-900 px-5 py-2 text-white hover:bg-stone-700 disabled:opacity-50">
          {pending ? <span role="status" aria-live="polite"><Spinner className="mr-2 h-3.5 w-3.5" />Saving your preferences…</span> : "Save preferences"}
        </button>
      </div>
    </form>
  );
}
