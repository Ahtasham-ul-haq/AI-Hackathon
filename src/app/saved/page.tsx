import Link from "next/link";
import { requireReader } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { formatPaperDate } from "@/lib/time";
import { RemoveSavedButton } from "@/components/paper/RemoveSavedButton";

type SavedRow = {
  created_at: string;
  stories: { id: string; headline: string; briefing: string; topics: string[]; paper_id: string; papers: { local_date: string } } | null;
};

export default async function SavedPage() {
  const { supabase, user, profile } = await requireReader();
  const { data } = await supabase.from("saved_stories")
    .select("created_at, stories!inner(id, headline, briefing, topics, paper_id, papers!inner(local_date))")
    .eq("user_id", user.id).order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as SavedRow[];
  return <>
    <SiteHeader email={profile.email} />
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="border-b-2 border-stone-900 pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Personal Library</span>
        <h1 className="mt-1 font-serif text-3xl font-black text-stone-950 sm:text-5xl">Saved Stories</h1>
        <p className="mt-2 text-sm text-stone-600">Stories you saved for another moment, kept across your devices.</p>
      </div>
      <ul className="mt-8 divide-y divide-stone-200 border-y border-stone-200 bg-white">
        {rows.map(({ stories: story }) => story && <li key={story.id} className="py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{formatPaperDate(story.papers.local_date)}</p>
          <Link href={`/paper/${story.papers.local_date}`} className="mt-1 block font-serif text-xl font-bold text-stone-900 hover:underline">{story.headline}</Link>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{story.briefing}</p>
          <RemoveSavedButton storyId={story.id} />
        </li>)}
        {!rows.length && <li className="py-10 text-center text-sm text-stone-500">Save a story from any edition and it will appear here.</li>}
      </ul>
    </main>
  </>;
}
