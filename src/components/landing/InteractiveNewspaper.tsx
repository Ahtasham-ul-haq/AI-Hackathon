"use client";

import { useState } from "react";
import Link from "next/link";

interface SampleStory {
  id: string;
  headline: string;
  briefing: string;
  section: string;
  sources: { name: string; time: string }[];
  isRelated?: boolean;
  sourcesDisagree?: boolean;
  readTime: string;
}

const SAMPLE_STORIES: SampleStory[] = [
  {
    id: "lead-1",
    section: "Front Page · Global Affairs & Climate",
    headline: "Global Grid Coalition Reaches Framework on Continental Clean Power Corridors",
    briefing:
      "Representatives from 34 national transmission operators agreed in Geneva to harmonize cross-border high-voltage direct current links by 2028. According to reporting from The Guardian, the accord resolves long-standing disputes over transmission tariff formulas, while BBC News noted that regional interconnectors in the North Sea will serve as the initial testing bed. Energy ministers confirmed that initial technical blueprints will be submitted to multilateral development banks before winter.",
    sources: [
      { name: "The Guardian", time: "3h ago" },
      { name: "BBC News", time: "4h ago" },
      { name: "Reuters", time: "5h ago" },
    ],
    sourcesDisagree: false,
    readTime: "2 min read",
  },
  {
    id: "lead-2",
    section: "Front Page · Technology & AI",
    headline: "Frontier AI Labs Adopt Strict Verifiable Watermarking for Synthetic Media",
    briefing:
      "A joint charter published by major machine learning laboratories establishes cryptographic signing requirements for high-resolution video and voice generations. TechCrunch highlighted that independent auditor verification will be mandatory within six months. The Verge reported that open-weights researchers raised concerns regarding computational verification overhead on commodity consumer hardware.",
    sources: [
      { name: "TechCrunch", time: "2h ago" },
      { name: "The Verge", time: "3h ago" },
    ],
    sourcesDisagree: true,
    readTime: "2 min read",
  },
  {
    id: "story-3",
    section: "Economics & Markets",
    headline: "Central Banks Signal Coordinated Pause as Core Services Inflation Stabilizes",
    briefing:
      "Quarterly fiscal summaries indicate policy rate hikes have achieved desired cooling across logistics and commercial credit without triggering systemic contractions in consumer spending, according to Dawn and Reuters.",
    sources: [
      { name: "Reuters", time: "6h ago" },
      { name: "Dawn", time: "7h ago" },
    ],
    readTime: "1 min read",
  },
  {
    id: "story-4",
    section: "Science & Discovery",
    headline: "Deep Space Array Detects Recurring Radio Bursts From Ancient Stellar Nursery",
    briefing:
      "Astrophysicists analyzing data from the Atacama baseline identified a steady 16-day cycle in faint cosmological signals, pinpointing their origin to a star-forming cluster 3.2 billion light-years distant. Reported by ScienceDaily and BBC Science.",
    sources: [
      { name: "ScienceDaily", time: "4h ago" },
      { name: "BBC News", time: "5h ago" },
    ],
    isRelated: true,
    readTime: "1 min read",
  },
];

export function InteractiveNewspaper({
  readerName = "Alex Mercer",
  editionDate = "Saturday, 17 October 2026",
}: {
  readerName?: string;
  editionDate?: string;
}) {
  const [activeStoryId, setActiveStoryId] = useState<string>("lead-1");
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [readWeight, setReadWeight] = useState<number>(3.8);

  const activeStory = SAMPLE_STORIES.find((s) => s.id === activeStoryId) || SAMPLE_STORIES[0];

  function handleSkip(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSkippedIds((prev) => new Set([...prev, id]));
    if (activeStoryId === id) {
      const remaining = SAMPLE_STORIES.filter((s) => s.id !== id && !skippedIds.has(s.id));
      if (remaining.length > 0) {
        setActiveStoryId(remaining[0].id);
      }
    }
  }

  function handleSelectStory(id: string) {
    setActiveStoryId(id);
    setReadWeight((w) => +(w + 0.1).toFixed(1));
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xs border-2 border-stone-800 bg-[#fffdf9] p-4 text-stone-900 shadow-xl transition-all sm:p-7 md:p-9">
      {/* Newspaper Top Header / Masthead */}
      <div className="border-b-4 border-double border-stone-900 pb-4 text-center">
        <div className="flex flex-col items-center justify-between gap-1 sm:flex-row text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          <span>Vol. II · No. 290</span>
          <span className="rounded bg-stone-100 px-2.5 py-0.5 text-stone-700">
            Personalized Edition for {readerName}
          </span>
          <span>Verified Multi-Source Digest</span>
        </div>

        {/* Master Logo Banner */}
        <div className="my-2 py-1">
          <h2 className="font-serif text-4xl font-black uppercase tracking-tight text-stone-950 sm:text-6xl md:text-7xl">
            MARGINS
          </h2>
          <p className="mt-0.5 text-xs font-serif italic text-stone-600 sm:text-sm">
            &ldquo;Veritas et Tempus&rdquo; — Synthesized from 22 verified press wires & publications
          </p>
        </div>

        {/* Sub-bar / Dateline */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-800 pt-2 text-[11px] font-medium uppercase tracking-wider text-stone-700">
          <span>{editionDate}</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">4 Sections · 18 Briefings Curated</span>
            <span className="inline-flex items-center gap-1 rounded bg-stone-900 px-2 py-0.5 text-[10px] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Live Model Feed
            </span>
          </div>
          <span className="font-mono text-[10px] text-stone-500">Local Timezone: Auto-Synchronized</span>
        </div>
      </div>

      {/* Editor Note / Transparency Callout */}
      <div className="my-4 flex items-center justify-between gap-4 border border-stone-300 bg-stone-100/70 px-3.5 py-2 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold uppercase tracking-wider text-stone-900">
            Editor&apos;s Dispatch:
          </span>
          <span className="truncate">
            Today&apos;s paper prioritizes energy infrastructure, AI accountability, and South Asian tech policy.
          </span>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 font-mono text-[11px] text-stone-500 md:flex">
          <span>Adaptive Interest Weight:</span>
          <span className="font-bold text-stone-900">{readWeight}</span>
        </div>
      </div>

      {/* Main Newspaper Layout: Left Column (Lead Story & Depth) & Right Column (Briefing Stack) */}
      <div className="grid grid-cols-1 gap-8 pt-2 lg:grid-cols-12">
        {/* Left Focus Column: The Selected / Lead Story */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between border-stone-300 lg:border-r lg:pr-8">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="border-b border-stone-900 pb-0.5 text-stone-900">
                {activeStory.section}
              </span>
              <span className="text-stone-300">|</span>
              <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-800">
                AI-written summary
              </span>
              {activeStory.isRelated && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                  Related Discovery
                </span>
              )}
              <span className="ml-auto text-stone-500">{activeStory.readTime}</span>
            </div>

            <h3 className="font-serif text-2xl font-bold leading-tight text-stone-950 sm:text-3xl md:text-4xl">
              {activeStory.headline}
            </h3>

            {/* Source Pill List */}
            <div className="my-3 flex flex-wrap items-center gap-2 border-y border-stone-200 py-1.5 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Reporting Outlets:</span>
              {activeStory.sources.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 font-medium text-stone-700">
                  {s.name} <span className="text-stone-400">({s.time})</span>
                  {idx < activeStory.sources.length - 1 && <span className="text-stone-300 ml-1">·</span>}
                </span>
              ))}
            </div>

            {/* Briefing Text */}
            <div className="mt-4 text-stone-800">
              <p className="font-serif text-base leading-relaxed text-stone-900 sm:text-lg sm:leading-relaxed">
                {activeStory.briefing}
              </p>
            </div>

            {/* Conflict / Source Divergence Notification */}
            {activeStory.sourcesDisagree && (
              <div className="mt-4 border-l-2 border-amber-600 bg-amber-50/70 p-2.5 text-xs text-amber-950">
                <p className="font-semibold">Source Divergence Noted:</p>
                <p className="mt-0.5 text-stone-700">
                  TechCrunch and The Verge report differing estimates on client-side cryptographic latency.
                  Cross-referenced for reader transparency.
                </p>
              </div>
            )}
          </div>

          {/* Interactive footer bar for this story */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3 text-xs">
            <div className="flex items-center gap-2 text-stone-500">
              <span className="h-2 w-2 rounded-full bg-stone-400"></span>
              <span>Clicking any briefing expands original sources & adjusts your weights.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleSkip(activeStory.id, e)}
                className="rounded border border-stone-300 px-2.5 py-1 text-stone-600 hover:border-stone-500 hover:bg-stone-100"
                title="Simulate skipping to refine recommendations"
              >
                Skip Story ✕
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Gazette Feed */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="border-b-2 border-stone-900 pb-1 text-xs font-bold uppercase tracking-wider text-stone-900">
            More in this Edition
          </div>

          <div className="flex flex-col divide-y divide-stone-200">
            {SAMPLE_STORIES.filter((s) => !skippedIds.has(s.id)).map((story) => {
              const isCurrent = story.id === activeStoryId;
              return (
                <div
                  key={story.id}
                  onClick={() => handleSelectStory(story.id)}
                  className={`group cursor-pointer py-3.5 transition ${
                    isCurrent ? "bg-stone-100/80 -mx-2 px-2 rounded-xs" : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <span className="truncate max-w-[190px]">{story.section.split("·")[1] || story.section}</span>
                    <span>{story.readTime}</span>
                  </div>

                  <h4
                    className={`mt-1 font-serif text-sm font-bold leading-snug group-hover:text-stone-950 ${
                      isCurrent ? "text-stone-950 underline underline-offset-2" : "text-stone-800"
                    }`}
                  >
                    {story.headline}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                    {story.briefing}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{story.sources.map((s) => s.name).join(", ")}</span>
                    <button
                      type="button"
                      onClick={(e) => handleSkip(story.id, e)}
                      className="text-stone-400 hover:text-stone-800"
                      title="Skip story"
                    >
                      Skip ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Callout in Edition */}
          <div className="mt-auto border border-stone-300 bg-stone-50 p-3.5 text-xs">
            <p className="font-serif font-bold text-stone-900">Read in print format?</p>
            <p className="mt-1 text-stone-600">
              The full publication engine typesets this edition into a dual-column PDF document ready for morning download.
            </p>
            <div className="mt-3">
              <Link
                href="/signup"
                className="inline-block text-xs font-semibold text-stone-900 underline hover:text-stone-700"
              >
                Create your first edition →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="mt-8 border-t border-stone-400 pt-3 text-center text-[11px] text-stone-500">
        Demo edition synthesized for interactive preview · Grounded solely in source articles with attribution
      </div>
    </div>
  );
}
