"use client";

import { useState } from "react";

export function PersonalizationDemo() {
  const [interests, setInterests] = useState([
    {
      id: "ai",
      label: "Artificial Intelligence",
      category: "Technology",
      weight: 4.8,
      initial: 3.0,
      trend: "strengthening",
      source: "You picked this",
      actionLog: "Opened 3 briefings",
    },
    {
      id: "cricket",
      label: "Pakistani Cricket",
      category: "Sports",
      weight: 4.0,
      initial: 3.0,
      trend: "strengthening",
      source: "From your sentence",
      actionLog: "Opened 1 story",
    },
    {
      id: "climate",
      label: "Energy Transition",
      category: "Climate & Environment",
      weight: 3.4,
      initial: 3.0,
      trend: "strengthening",
      source: "Learned from your reading",
      actionLog: "Discovered via Related",
    },
    {
      id: "markets",
      label: "Banking & Markets",
      category: "Business",
      weight: 1.8,
      initial: 3.0,
      trend: "weakening",
      source: "You picked this",
      actionLog: "Skipped 1 briefing, scrolled past 1",
    },
  ]);

  function simulateAction(id: string, delta: number, logMsg: string) {
    setInterests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newWeight = Math.max(0.2, +(item.weight + delta).toFixed(1));
        const trend = newWeight > item.initial ? "strengthening" : newWeight < item.initial ? "weakening" : "steady";
        return {
          ...item,
          weight: newWeight,
          trend,
          actionLog: logMsg,
        };
      })
    );
  }

  const maxWeight = 6.0;

  return (
    <div className="rounded-xs border border-stone-300 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Live Algorithmic Transparency
          </span>
          <h3 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
            What Margins Learns About You
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-stone-600 font-medium">Atomic Real-Time Updates</span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        Unlike opaque algorithmic black boxes, Margins exposes the exact numerical weights governing tomorrow&apos;s
        curation. You can inspect every weight change, adjust preferences manually, or reset anytime.
      </p>

      {/* Signal Rules Explainer */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
        <div className="rounded border border-stone-200 bg-stone-50/80 p-2.5">
          <span className="font-bold text-emerald-800">Reading a briefing</span>
          <p className="mt-0.5 text-stone-600">Adds <strong className="text-stone-900">+1.0</strong> to its topic & subtopic weights immediately.</p>
        </div>
        <div className="rounded border border-stone-200 bg-stone-50/80 p-2.5">
          <span className="font-bold text-rose-800">Tapping Skip (✕)</span>
          <p className="mt-0.5 text-stone-600">Subtracts <strong className="text-stone-900">-1.0</strong> and removes it from the web view.</p>
        </div>
        <div className="rounded border border-stone-200 bg-stone-50/80 p-2.5">
          <span className="font-bold text-amber-800">Scrolling Past</span>
          <p className="mt-0.5 text-stone-600">Weakens by <strong className="text-stone-900">-0.2</strong> once per story when left unopened.</p>
        </div>
      </div>

      {/* Interactive Weight Sliders / List */}
      <div className="mt-6 space-y-4">
        {interests.map((item) => {
          const percentage = Math.min(100, Math.max(5, (item.weight / maxWeight) * 100));
          const isHigher = item.weight > item.initial;
          const isLower = item.weight < item.initial;

          return (
            <div
              key={item.id}
              className="rounded-xs border border-stone-200 bg-[#fdfbf7] p-3.5 transition hover:border-stone-300"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-stone-900">{item.label}</span>
                  <span className="text-[11px] text-stone-500">in {item.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {isHigher ? (
                    <span className="font-semibold text-emerald-800">▲ strengthening (+{(item.weight - item.initial).toFixed(1)})</span>
                  ) : isLower ? (
                    <span className="font-semibold text-rose-800">▼ weakening ({(item.weight - item.initial).toFixed(1)})</span>
                  ) : (
                    <span className="text-stone-500">steady</span>
                  )}
                  <span className="font-mono text-xs font-bold text-stone-900">
                    weight: {item.weight.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.weight >= item.initial ? "bg-stone-900" : "bg-rose-700"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Source tag & Interactive control buttons */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-stone-500">
                  {item.source} · {item.actionLog}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 mr-1 hidden sm:inline">Simulate:</span>
                  <button
                    type="button"
                    onClick={() => simulateAction(item.id, 1.0, "Simulated open (+1.0)")}
                    className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900"
                  >
                    + Open story
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateAction(item.id, -1.0, "Simulated skip (-1.0)")}
                    className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900"
                  >
                    - Skip story
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200 pt-3">
        <span>Starting baseline is 3.0 for all selected topics.</span>
        <span className="font-mono text-[11px]">RLS owner-only isolated database</span>
      </div>
    </div>
  );
}
