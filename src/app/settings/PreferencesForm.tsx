"use client";

import { useActionState, useState } from "react";
import { Spinner } from "@/components/Loading";
import { savePreferences, type SettingsState } from "./actions";
import { LANGUAGES, REGIONS } from "@/lib/preferences";

type Prefs = {
  region: string | null;
  language: string;
  preferred_sources: string[];
  avoided_sources: string[];
  length: "short" | "standard" | "long";
  discovery_ratio: number;
  email_delivery: boolean;
  delivery_hour: number;
};

const inputStyle =
  "mt-1.5 w-full rounded-sm border border-stone-300 bg-[#fdfbf7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-stone-900 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900";

export function PreferencesForm({ prefs }: { prefs: Prefs }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(savePreferences, undefined);
  const [discoveryRatio, setDiscoveryRatio] = useState(prefs.discovery_ratio);

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Geographic Edition / Region
        </label>
        <select name="region" defaultValue={prefs.region ?? ""} className={inputStyle}>
          {REGIONS.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Publication Language
        </label>
        <select name="language" defaultValue={prefs.language} className={inputStyle}>
          {LANGUAGES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Preferred News Outlets <span className="font-normal text-stone-500 font-sans lowercase">(comma separated)</span>
        </label>
        <input
          name="preferred"
          defaultValue={prefs.preferred_sources.join(", ")}
          placeholder="e.g. BBC News, Dawn, The Guardian"
          className={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Outlets to Avoid <span className="font-normal text-stone-500 font-sans lowercase">(comma separated)</span>
        </label>
        <input
          name="avoided"
          defaultValue={prefs.avoided_sources.join(", ")}
          placeholder="e.g. The Sun, Daily Mail"
          className={inputStyle}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Daily Issue Length
        </label>
        <select name="length" defaultValue={prefs.length} className={inputStyle}>
          <option value="short">Short Edition (10–12 briefings, ~5 min read)</option>
          <option value="standard">Standard Edition (15–20 briefings, ~10 min read)</option>
          <option value="long">Long Broadside (22–25 briefings, ~15 min read)</option>
        </select>
      </div>

      <div className="sm:col-span-2 rounded border border-stone-200 bg-stone-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="discovery_ratio" className="text-xs font-semibold uppercase tracking-wider text-stone-700">Discovery stories</label>
          <span className="font-mono text-sm font-bold text-stone-900">{discoveryRatio}%</span>
        </div>
        <input id="discovery_ratio" name="discovery_ratio" type="range" min="0" max="40" step="5" value={discoveryRatio} onChange={(event) => setDiscoveryRatio(Number(event.target.value))} className="mt-3 w-full accent-stone-900" />
        <p className="mt-1 text-xs text-stone-500">Choose how much of each edition explores related and lower-weighted interests.</p>
      </div>

      <div className="sm:col-span-2 rounded border border-stone-200 bg-stone-50 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <input type="checkbox" name="email_delivery" defaultChecked={prefs.email_delivery} className="accent-stone-900" />
          Email me the daily edition
        </label>
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-600">
          <label htmlFor="delivery_hour">Preferred local delivery hour</label>
          <select id="delivery_hour" name="delivery_hour" defaultValue={prefs.delivery_hour} className="rounded border border-stone-300 bg-white px-2 py-1">
            {Array.from({ length: 24 }, (_, hour) => {
              const period = hour < 12 ? "AM" : "PM";
              const displayHour = hour % 12 || 12;
              return <option key={hour} value={hour}>{displayHour}:00 {period}</option>;
            })}
          </select>
        </div>
        <p className="mt-2 text-xs text-stone-500">You can turn delivery off here at any time.</p>
      </div>

      <div className="flex flex-col justify-end gap-3 sm:col-span-2 border-t border-stone-200 pt-4">
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
              Saving your preferences…
            </span>
          ) : (
            "Save preferences"
          )}
        </button>
      </div>
    </form>
  );
}
