"use client";

import { useEffect, useRef, useState } from "react";
import type { PaperStory } from "@/lib/papers";
import { StoryImage } from "./StoryImage";
import { track } from "./track";

function teaser(text: string) {
  const first = text.match(/^.{40,220}?[.!?](\s|$)/)?.[0] ?? text.slice(0, 200);
  return first.trim();
}

function shortDate(iso: string | null) {
  if (!iso) return "undated";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function StoryCard({ story, lead, skipped }: { story: PaperStory; lead?: boolean; skipped?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(!!skipped);
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

  if (hidden) return null;
  const body = open ? story.briefing : teaser(story.briefing);
  const canExpand = body !== story.briefing || !open;

  return (
    <article ref={ref} className={`break-inside-avoid border-b border-stone-300 pb-5 ${lead ? "md:col-span-2" : ""}`}>
      {story.image_url && <StoryImage src={story.image_url} credit={story.image_credit} large={lead} />}
      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        {story.is_related && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">Related</span>}
        <span className="text-stone-500">{story.ai_written ? "AI-written summary" : "Outlet's own summary"}</span>
      </div>
      <h3
        className={`cursor-pointer font-serif font-bold leading-tight hover:underline ${lead ? "text-3xl md:text-4xl" : "text-xl"}`}
        onClick={() => {
          setOpen(true);
          markOpen();
        }}
      >
        {story.headline}
      </h3>
      <p className={`mt-2 leading-relaxed text-stone-800 ${lead ? "text-lg" : ""}`}>{body}</p>
      {open && story.sources_disagree && (
        <p className="mt-2 border-l-2 border-amber-500 pl-2 text-sm text-amber-900">
          The outlets&apos; reports differ on some details; see the sources below.
        </p>
      )}
      {open && (
        <div className="mt-3 text-sm text-stone-600">
          <span className="font-medium">Sources: </span>
          {story.sources.map((s, i) => (
            <span key={s.id}>
              {i > 0 && " · "}
              {s.source_name} ({shortDate(s.published_at)}){" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer" onClick={markOpen}
                className="text-xs text-stone-500 underline hover:text-stone-900">
                original source ↗
              </a>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm">
        {canExpand && !open && (
          <button
            className="font-medium underline underline-offset-2"
            onClick={() => {
              setOpen(true);
              markOpen();
            }}
          >
            Read the briefing
          </button>
        )}
        {!open && (
          <span className="text-xs text-stone-500">
            {story.sources.map((s) => s.source_name).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
          </span>
        )}
        <button
          className="ml-auto text-xs text-stone-500 hover:text-stone-900"
          title="Hide this story and show fewer like it"
          onClick={() => {
            setHidden(true);
            track(story.id, "skip");
          }}
        >
          Skip ✕
        </button>
      </div>
    </article>
  );
}
