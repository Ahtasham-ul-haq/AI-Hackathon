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
    <div className="grid gap-3 sm:grid-cols-2">
      {TOPICS.map((t) => {
        const on = picked.has(t.slug);
        return (
          <div key={t.slug}
            className={`rounded border p-3 transition ${on ? "border-stone-900 bg-white" : "border-stone-300 bg-stone-50"}`}>
            <label className="flex cursor-pointer items-center gap-2 font-medium">
              <input type="checkbox" name="topic" value={t.slug} checked={on} onChange={() => toggle(t.slug)}
                className="h-4 w-4 accent-stone-900" />
              {t.name}
            </label>
            {on && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.subtopics.map((s) => {
                  const v = `${t.slug}::${s}`;
                  return (
                    <label key={s}
                      className="cursor-pointer rounded-full border border-stone-300 px-2.5 py-0.5 text-sm has-[:checked]:border-stone-900 has-[:checked]:bg-stone-900 has-[:checked]:text-white">
                      <input type="checkbox" name="sub" value={v} defaultChecked={initialSubtopics.includes(v)}
                        className="sr-only" />
                      {s}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
