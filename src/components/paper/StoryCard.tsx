"use client";

import { useEffect, useRef, useState } from "react";
import type { PaperStory } from "@/lib/papers";
import { StoryImage } from "./StoryImage";
import { track } from "./track";
import { TOPIC_BY_SLUG } from "@/lib/topics";

function teaser(text: string) {
  const first = text.match(/^.{40,220}?[.!?](\s|$)/)?.[0] ?? text.slice(0, 200);
  return first.trim();
}

function shortDate(iso: string | null) {
  if (!iso) return "undated";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function StoryCard({ story, lead, skipped, initiallySaved = false }: { story: PaperStory; lead?: boolean; skipped?: boolean; initiallySaved?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(!!skipped);
  const [isSkipping, setIsSkipping] = useState(false);
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [muting, setMuting] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const opened = useRef(false);

  // Scrolling past a story without opening it is a weak "not interested" signal (once per story).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let seen = false;
    let reported = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) seen = true;
        else if (seen && !entry.isIntersecting && entry.boundingClientRect.top < 0 && !opened.current && !reported) {
          reported = true;
          track(story.id, "scroll_past");
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [story.id]);

  function markOpen() {
    if (opened.current) return;
    opened.current = true;
    track(story.id, "open");
  }

  function handleSkip() {
    setIsSkipping(true);
    setTimeout(() => {
      setHidden(true);
      track(story.id, "skip");
    }, 200);
  }

  async function toggleSaved() {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/saved-stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storyId: story.id, saved: !saved }) });
      if (response.ok) setSaved(!saved);
    } finally { setSaving(false); }
  }

  async function muteStory() {
    if (muting) return;
    setMuting(true);
    const response = await fetch("/api/muted-stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storyId: story.id }) });
    if (response.ok) setHidden(true);
    setMuting(false);
  }

  if (hidden) return null;
  const body = open ? story.briefing : teaser(story.briefing);
  const canExpand = body !== story.briefing || !open;

  return (
    <article
      id={story.id}
      ref={ref}
      className={`break-inside-avoid border-b border-stone-300 pb-6 transition-all duration-200 ${
        isSkipping ? "opacity-0 scale-98" : "opacity-100"
      } ${lead ? "md:col-span-2 md:border-b-2 md:border-stone-400 md:pb-8" : ""}`}
    >
      {story.image_url && <StoryImage src={story.image_url} credit={story.image_credit} large={lead} />}

      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        {story.is_related && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-950 font-bold">
            Related Discovery
          </span>
        )}
        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-600">
          {story.ai_written ? "AI-written summary" : "Outlet's own summary"}
        </span>
      </div>

      <h3
        className={`cursor-pointer font-serif font-bold leading-tight text-stone-950 transition-colors hover:text-stone-700 hover:underline ${
          lead ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-2xl"
        }`}
        onClick={() => {
          setOpen(true);
          markOpen();
        }}
      >
        {story.headline}
      </h3>

      <p className={`mt-2.5 font-serif leading-relaxed text-stone-800 ${lead ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}>
        {body}
      </p>

      {open && story.sources_disagree && (
        <div className="mt-3 border-l-2 border-amber-600 bg-amber-50/70 p-2 text-xs text-amber-950 animate-fade-in">
          <span className="font-bold">Editorial Note:</span> Outlets report conflicting details on this event. Review the original sources below.
        </div>
      )}

      {open && (
        <div className="mt-3 border-t border-stone-200 pt-2.5 text-xs text-stone-600 animate-fade-in">
          <span className="font-semibold text-stone-800">Primary Outlets: </span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {story.sources.map((s, i) => (
              <span key={s.id} className="inline-flex items-center gap-1">
                <span className="font-medium text-stone-900">{s.source_name}</span>
                <span className="text-stone-500">({shortDate(s.published_at)})</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={markOpen}
                  className="underline text-stone-500 hover:text-stone-900 ml-0.5"
                >
                  original source ↗
                </a>
                {i < story.sources.length - 1 && <span className="text-stone-300 ml-1.5">·</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <div>
          {canExpand && !open ? (
            <button
              type="button"
              className="font-semibold text-stone-900 underline underline-offset-3 hover:text-stone-600 transition cursor-pointer"
              onClick={() => {
                setOpen(true);
                markOpen();
              }}
            >
              Read full briefing ↓
            </button>
          ) : (
            <span className="text-[11px] text-stone-500">
              {story.sources.map((s) => s.source_name).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
        <button type="button" disabled={saving} onClick={toggleSaved} className="rounded px-2 py-0.5 text-[11px] text-stone-500 underline underline-offset-2 hover:text-stone-900 disabled:opacity-50" aria-pressed={saved}>
          {saved ? "Saved ✓" : "Save for later"}
        </button>
        <button type="button" disabled={muting} onClick={muteStory} className="rounded px-2 py-0.5 text-[11px] text-stone-500 underline underline-offset-2 hover:text-rose-800 disabled:opacity-50" title="Hide this story and similar source links in future editions">{muting ? "Muting…" : "Mute story"}</button>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-[11px] text-stone-600 transition hover:bg-stone-200/80 hover:text-stone-900 cursor-pointer"
          title="Hide this story and decrease similar topics tomorrow"
          onClick={handleSkip}
        >
          Skip ✕
        </button>
        </div>
      </div>

      <div className="mt-2 print:hidden">
        <button type="button" onClick={() => setWhyOpen(!whyOpen)} aria-expanded={whyOpen} className="text-[11px] font-medium text-stone-500 underline underline-offset-2 hover:text-stone-900">{whyOpen ? "Hide story details" : "Why this story?"}</button>
        {whyOpen && <div className="mt-2 rounded border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
          <p><strong className="text-stone-800">Matched interests:</strong> {story.topics.map((topic) => TOPIC_BY_SLUG[topic]?.name ?? topic).join(", ") || "General news"}{story.subtopics.length ? ` · ${story.subtopics.join(", ")}` : ""}</p>
          <p className="mt-1"><strong className="text-stone-800">Coverage:</strong> {story.sources.length} {story.sources.length === 1 ? "source" : "sources"}; newest source {story.sources[0]?.published_at ? shortDate(story.sources[0].published_at) : "date unavailable"}.</p>
          {story.is_related && <p className="mt-1">This is a related discovery selected to broaden your edition.</p>}
        </div>}
      </div>
    </article>
  );
}
