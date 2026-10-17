import Link from "next/link";
import { notFound } from "next/navigation";
import { requireReader } from "@/lib/auth";
import { loadPaper } from "@/lib/papers";
import { formatPaperDate } from "@/lib/time";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryImage } from "@/components/paper/StoryImage";
import { RemoveSavedButton } from "@/components/paper/RemoveSavedButton";
import { ListenButton } from "@/components/paper/ListenButton";

type SavedStoryRow = {
  stories: { id: string; paper_id: string; papers: { local_date: string } } | null;
};

export default async function SavedStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { supabase, user, profile } = await requireReader();
  const { data } = await supabase.from("saved_stories")
    .select("stories!inner(id, paper_id, papers!inner(local_date))")
    .eq("user_id", user.id).eq("story_id", id).maybeSingle();
  const saved = data as unknown as SavedStoryRow | null;
  const date = saved?.stories?.papers?.local_date;
  if (!date) notFound();
  const paper = await loadPaper(supabase, user.id, date);
  const story = paper?.sections.flatMap((section) => section.stories).find((item) => item.id === id);
  if (!paper || !story) notFound();

  return <>
    <SiteHeader email={profile.email} />
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/saved" className="text-xs font-semibold uppercase tracking-wider text-stone-500 underline underline-offset-4 hover:text-stone-900">← Saved stories</Link>
      <article className="mt-6 border-y-2 border-stone-900 py-7 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Saved from {formatPaperDate(paper.local_date)}</p>
        {story.image_url && <StoryImage src={story.image_url} credit={story.image_credit} large />}
        <h1 className="mt-5 font-serif text-3xl font-black leading-tight text-stone-950 sm:text-5xl">{story.headline}</h1>
        <p className="mt-5 font-serif text-base leading-relaxed text-stone-800 sm:text-lg">{story.briefing}</p>
        <p className="mt-3 text-xs text-stone-500">{story.ai_written ? "AI-written summary" : "Outlet's own summary"}{story.sources_disagree ? " · Sources report differing details" : ""}</p>
        <div className="mt-5 border-t border-stone-200 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">Original reporting</h2>
          <ul className="mt-2 space-y-2">
            {story.sources.map((source) => <li key={source.id} className="text-sm">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-900 underline underline-offset-2 hover:text-stone-600">{source.source_name}: {source.title} ↗</a>
              <span className="ml-2 text-xs text-stone-500">{source.published_at ? new Date(source.published_at).toLocaleDateString("en", { dateStyle: "medium" }) : "Date unavailable"}</span>
            </li>)}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
          <ListenButton text={`${story.headline}. ${story.briefing}`} language={profile.language} />
          <RemoveSavedButton storyId={story.id} returnTo="/saved" />
        </div>
      </article>
      <Link href={`/paper/${paper.local_date}#${story.id}`} className="mt-5 inline-block text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950">View this story in the full edition →</Link>
    </main>
  </>;
}
