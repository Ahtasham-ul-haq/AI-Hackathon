import { notFound } from "next/navigation";
import { requireReader } from "@/lib/auth";
import { loadPaper, skippedStoryIds, savedStoryIds } from "@/lib/papers";
import { SiteHeader } from "@/components/SiteHeader";
import { PaperView } from "@/components/paper/PaperView";

export default async function PaperByDatePage({ params }: PageProps<"/paper/[date]">) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const { supabase, user, profile } = await requireReader();
  const paper = await loadPaper(supabase, user.id, date);
  if (!paper) {
    return (
      <>
        <SiteHeader email={profile.email} />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-serif text-3xl font-bold">No paper for {date}</h1>
          <p className="mt-2 text-stone-600">Pick another date from your past editions.</p>
        </main>
      </>
    );
  }
  const skipped = await skippedStoryIds(supabase, user.id, paper);
  const saved = await savedStoryIds(supabase, user.id, paper);
  return (
    <>
      <SiteHeader email={profile.email} />
      <PaperView paper={paper} skipped={skipped} savedStoryIds={saved} readerName={profile.display_name} language={profile.language} />
    </>
  );
}
