import { requireReader } from "@/lib/auth";
import { START_WEIGHT, TOPIC_BY_SLUG } from "@/lib/topics";
import { SiteHeader } from "@/components/SiteHeader";
import { AutoRefresh } from "@/components/paper/Preparing";
import { correctInterest, removeInterest, resetToOnboarding } from "./actions";

type Row = {
  id: string; topic: string; subtopic: string; label: string; weight: number;
  initial_weight: number | null; source: "onboarding" | "note" | "learned"; updated_at: string;
};

const SOURCE_LABEL = { onboarding: "You picked this", note: "From your sentence", learned: "Learned from your reading" };

function Trend({ row }: { row: Row }) {
  const base = row.initial_weight ?? 0;
  const diff = row.weight - base;
  if (Math.abs(diff) < 0.05) return <span className="text-stone-500">steady</span>;
  return diff > 0 ? (
    <span className="text-green-800">▲ strengthening (+{diff.toFixed(1)})</span>
  ) : (
    <span className="text-red-800">▼ weakening ({diff.toFixed(1)})</span>
  );
}

export default async function LearnedPage() {
  const { supabase, user, profile } = await requireReader();
  const { data } = await supabase
    .from("interest_weights").select("*").eq("user_id", user.id).order("weight", { ascending: false });
  const rows = (data ?? []) as Row[];
  const max = Math.max(START_WEIGHT * 2, ...rows.map((r) => r.weight));

  return (
    <>
      <SiteHeader email={profile.email} />
      <AutoRefresh everyMs={5000} />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl font-bold">What we&apos;ve learned about you</h1>
        <p className="mt-1 text-stone-600">
          Opening a story strengthens its topics; skipping weakens them; scrolling past weakens them a little.
          This page updates live. Remove or correct anything that&apos;s wrong.
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded border border-stone-300 bg-white p-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-semibold">{r.label}</span>
                {r.subtopic && <span className="text-xs text-stone-500">in {TOPIC_BY_SLUG[r.topic]?.name ?? r.topic}</span>}
                <span className="ml-auto text-sm"><Trend row={r} /></span>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-stone-200">
                <div
                  className={`h-2 rounded ${r.weight >= (r.initial_weight ?? 0) ? "bg-stone-800" : "bg-red-700"}`}
                  style={{ width: `${Math.max(2, Math.min(100, (Math.max(r.weight, 0) / max) * 100))}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span>{SOURCE_LABEL[r.source]} · interest {r.weight.toFixed(1)}</span>
                <form action={correctInterest.bind(null, r.id, "more")} className="ml-auto">
                  <button className="underline">More of this</button>
                </form>
                <form action={correctInterest.bind(null, r.id, "less")}>
                  <button className="underline">Less of this</button>
                </form>
                <form action={removeInterest.bind(null, r.id)}>
                  <button className="text-red-800 underline">Remove</button>
                </form>
              </div>
            </li>
          ))}
          {!rows.length && <li className="text-stone-500">No interests yet. Pick topics in Settings.</li>}
        </ul>
        <form action={resetToOnboarding} className="mt-8">
          <button className="rounded border border-stone-400 px-4 py-2 text-sm hover:bg-stone-100">
            Reset to my onboarding choices
          </button>
        </form>
      </main>
    </>
  );
}
