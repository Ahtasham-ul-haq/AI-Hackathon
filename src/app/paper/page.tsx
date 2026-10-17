import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireReader, isBuilder } from "@/lib/auth";
import { generatePaperForReader } from "@/lib/generate";
import { loadPaper, skippedStoryIds, savedStoryIds } from "@/lib/papers";
import { localDate } from "@/lib/time";
import { SiteHeader } from "@/components/SiteHeader";
import { PaperView } from "@/components/paper/PaperView";
import { AutoRefresh, Preparing } from "@/components/paper/Preparing";
import { BuilderButton } from "@/components/BuilderButton";

// On-visit fallback generation runs in after() from this page.
export const maxDuration = 300;

export default async function TodayPage() {
  const { supabase, user, profile } = await requireReader();
  if (!profile.onboarded) redirect("/onboarding");

  const today = localDate(profile.timezone);
  const paper = await loadPaper(supabase, user.id);
  const missingToday = !paper || paper.local_date < today;

  let lastError: string | null = null;
  if (missingToday) {
    // On-visit fallback: the morning run missed this reader (or is still going).
    after(() => generatePaperForReader(user.id, "visit").catch((e) => console.error("visit generation", e)));
    const { data: run } = await supabase
      .from("generation_runs").select("status, error").eq("user_id", user.id).eq("local_date", today).maybeSingle();
    if (run?.status === "failed") lastError = run.error;
  }

  if (!paper) {
    return (
      <>
        <SiteHeader email={profile.email} />
        <Preparing failed={lastError} />
      </>
    );
  }

  const skipped = await skippedStoryIds(supabase, user.id, paper);
  const saved = await savedStoryIds(supabase, user.id, paper);
  return (
    <>
      <SiteHeader email={profile.email} />
      {missingToday && (
        <div className="bg-stone-900 px-4 py-2 text-center text-sm text-white">
          <AutoRefresh everyMs={6000} />
          Today&apos;s edition is being prepared. Here&apos;s your latest paper meanwhile.
        </div>
      )}
      {isBuilder(user.email) && <BuilderButton />}
      <PaperView paper={paper} skipped={skipped} savedStoryIds={saved} readerName={profile.display_name} language={profile.language} />
    </>
  );
}
