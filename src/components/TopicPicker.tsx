"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/topics";

export function TopicPicker({
  initialTopics = [],
  initialSubtopics = [],
}: {
  initialTopics?: string[];
  /** "slug::Subtopic" values */
  initialSubtopics?: string[];
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set(initialTopics));

  function toggle(slug: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {TOPICS.map((t) => {
        const on = picked.has(t.slug);
        return (
          <div
            key={t.slug}
            className={`group rounded-xs border p-4 transition-all duration-200 ${
              on
                ? "border-stone-900 bg-white shadow-xs ring-1 ring-stone-900/10"
                : "border-stone-300/90 bg-[#faf8f3]/60 hover:border-stone-400 hover:bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-center justify-between font-serif text-base font-bold text-stone-900">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="topic"
                  value={t.slug}
                  checked={on}
                  onChange={() => toggle(t.slug)}
                  className="h-4 w-4 rounded-xs accent-stone-900 transition focus:ring-1 focus:ring-stone-900"
                />
                <span>{t.name}</span>
              </span>
              <span className="text-[11px] font-sans font-normal uppercase tracking-wider text-stone-500">
                {t.subtopics.length} subtopics
              </span>
            </label>

            {on && (
              <div className="mt-3.5 border-t border-stone-200 pt-3 animate-fade-in">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Select key subtopics (optional):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {t.subtopics.map((s) => {
                    const v = `${t.slug}::${s}`;
                    return (
                      <label
                        key={s}
                        className="cursor-pointer rounded-full border border-stone-300 bg-stone-50/80 px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-500 has-[:checked]:border-stone-900 has-[:checked]:bg-stone-900 has-[:checked]:text-white active:scale-95"
                      >
                        <input
                          type="checkbox"
                          name="sub"
                          value={v}
                          defaultChecked={initialSubtopics.includes(v)}
                          className="sr-only"
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
