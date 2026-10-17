import type { Paper } from "@/lib/papers";
import { formatPaperDate } from "@/lib/time";
import { StoryCard } from "./StoryCard";
import { PdfButton } from "./PdfButton";
import { ListenButton } from "./ListenButton";

export function PaperView({
  paper,
  skipped,
  readerName,
  savedStoryIds = [],
  language = "en",
}: {
  paper: Paper;
  skipped: string[];
  readerName: string | null;
  savedStoryIds?: string[];
  language?: string;
}) {
  const storyCount = paper.sections.reduce((n, s) => n + s.stories.length, 0);
  const editionText = paper.sections.flatMap((section) => [section.name, ...section.stories.flatMap((story) => [story.headline, story.briefing])]).join(". ");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Newspaper Top Header / Masthead */}
      <header className="border-b-4 border-double border-stone-900 pb-4 text-center">
        {/* Top Kicker Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          <span>Personal daily edition</span>
          <span className="rounded bg-stone-100 px-2 py-0.5 text-stone-700">
            {readerName ? `Curated for ${readerName}` : "Your Personal Edition"}
          </span>
          <span>Source-linked briefings</span>
        </div>

        {/* Master Logo */}
        <div className="my-2">
          <h1 className="font-serif text-4xl font-black uppercase tracking-tight text-stone-950 sm:text-6xl md:text-7xl">
            MARGINS
          </h1>
          <p className="mt-0.5 font-serif italic text-xs text-stone-600 sm:text-sm">
            A daily paper, edited around what matters to you
          </p>
        </div>

        {/* Dateline Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-900 pt-2 text-xs uppercase tracking-wider text-stone-700">
          <span className="font-serif font-bold">{formatPaperDate(paper.local_date)}</span>
          <span className="hidden sm:inline">
            {storyCount} stories · {paper.sections.length} sections
          </span>
          <PdfButton
            paperId={paper.id}
            date={paper.local_date}
            failedBefore={!!paper.pdf_failed_at && !paper.pdf_path}
          />
        </div>
        <div className="mt-3 flex justify-center"><ListenButton text={editionText} language={language} /></div>
      </header>

      {/* Editorial Note (e.g. if plain edition fallback triggered or news status) */}
      {paper.note && (
        <div className="mt-6 border-l-4 border-amber-600 bg-amber-50/80 p-4 text-sm text-stone-800">
          <p className="font-bold text-amber-950">Notice from the Editor:</p>
          <p className="mt-1">{paper.note}</p>
        </div>
      )}

      {/* Sections */}
      {paper.sections.map((section, si) => (
        <section key={section.id} className="mt-12">
          <div className="mb-6 flex items-baseline justify-between border-b-2 border-stone-900 pb-1.5">
            <h2 className="font-serif text-2xl font-black uppercase tracking-wide text-stone-950 sm:text-3xl">
              {section.name}
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Section {String.fromCharCode(65 + si)}
            </span>
          </div>

          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
            {section.stories.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                lead={si === 0 && i === 0}
                skipped={skipped.includes(story.id)}
                initiallySaved={savedStoryIds.includes(story.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Editorial standards footer */}
      <footer className="mt-16 border-t-2 border-stone-900 pt-6 text-xs text-stone-600">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
          <p className="max-w-xl leading-relaxed">
            Briefings marked &ldquo;AI-written summary&rdquo; are generated from source headlines and snippets.
            Summaries can omit nuance; follow the links for full reporting. Disagreements are flagged when detected.
          </p>
          <span className="font-mono text-[11px] text-stone-500 shrink-0">
            Edition End · {storyCount} Articles Total
          </span>
        </div>
      </footer>
    </div>
  );
}
