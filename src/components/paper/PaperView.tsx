import Link from "next/link";
import type { Paper } from "@/lib/papers";
import { formatPaperDate } from "@/lib/time";
import { StoryCard } from "./StoryCard";

export function PaperView({
  paper,
  skipped,
  readerName,
}: {
  paper: Paper;
  skipped: string[];
  readerName: string | null;
}) {
  const storyCount = paper.sections.reduce((n, s) => n + s.stories.length, 0);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="border-b-4 border-double border-stone-900 pb-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          {readerName ? `Edited for ${readerName}` : "Your personal edition"}
        </p>
        <h1 className="mt-1 font-serif text-4xl font-black tracking-tight sm:text-6xl">The Morning Paper</h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-900 pt-2 text-xs uppercase tracking-wider">
          <span>{formatPaperDate(paper.local_date)}</span>
          <span>{storyCount} stories · {paper.sections.length} sections</span>
          <Link href={`/api/papers/${paper.id}/pdf`} prefetch={false} className="font-semibold underline">
            Download PDF
          </Link>
        </div>
      </header>

      {paper.note && (
        <p className="mt-6 border border-stone-400 bg-stone-100 p-3 text-sm text-stone-700">{paper.note}</p>
      )}

      {paper.sections.map((section, si) => (
        <section key={section.id} className="mt-10">
          <h2 className="mb-5 border-b-2 border-stone-900 pb-1 font-serif text-2xl font-bold uppercase tracking-wide">
            {section.name}
          </h2>
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            {section.stories.map((story, i) => (
              <StoryCard key={story.id} story={story} lead={si === 0 && i === 0} skipped={skipped.includes(story.id)} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-12 border-t border-stone-400 pt-4 text-xs text-stone-500">
        Briefings marked &ldquo;AI-written summary&rdquo; are generated only from the outlets&apos; headlines and snippets
        listed with each story. Follow &ldquo;original source&rdquo; for the full reporting.
      </footer>
    </div>
  );
}
