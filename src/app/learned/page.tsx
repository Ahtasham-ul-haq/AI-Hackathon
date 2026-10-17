import { requireReader } from "@/lib/auth";
import { START_WEIGHT, TOPIC_BY_SLUG } from "@/lib/topics";
import { SiteHeader } from "@/components/SiteHeader";
import { AutoRefresh } from "@/components/paper/Preparing";
import { SubmitButton } from "@/components/Loading";
import { correctInterest, removeInterest, resetToOnboarding } from "./actions";

type Row = {
  id: string;
  topic: string;
  subtopic: string;
  label: string;
  weight: number;
  initial_weight: number | null;
  source: "onboarding" | "note" | "learned";
  updated_at: string;
};

const SOURCE_LABEL = {
  onboarding: "You selected this",
  note: "Derived from your sentence",
  learned: "Learned from reading activity",
};

function Trend({ row }: { row: Row }) {
  const base = row.initial_weight ?? 0;
  const diff = row.weight - base;
  if (Math.abs(diff) < 0.05) return <span className="text-stone-500 font-mono text-xs">steady</span>;
  return diff > 0 ? (
    <span className="font-semibold text-emerald-800 text-xs">
      ▲ strengthening (+{diff.toFixed(1)})
    </span>
  ) : (
    <span className="font-semibold text-rose-800 text-xs">
      ▼ weakening ({diff.toFixed(1)})
    </span>
  );
}

export default async function LearnedPage() {
  const { supabase, user, profile } = await requireReader();
  const { data } = await supabase
    .from("interest_weights")
    .select("*")
    .eq("user_id", user.id)
    .order("weight", { ascending: false });

  const rows = (data ?? []) as Row[];
  const max = Math.max(START_WEIGHT * 2, ...rows.map((r) => r.weight));

  return (
    <>
      <SiteHeader email={profile.email} />
      <AutoRefresh everyMs={5000} />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        {/* Editorial Section Header */}
        <div className="border-b-2 border-stone-900 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
              Transparent Personalization
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-stone-600 font-medium">Live Weight Tracking</span>
            </div>
          </div>

          <h1 className="mt-1 font-serif text-3xl font-black text-stone-950 sm:text-5xl">
            What We&apos;ve Learned About You
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
            Opening a story strengthens its topics (+1.0); skipping weakens them (-1.0); scrolling past
            weakens them slightly (-0.2). This ledger shows your active model weights in real time.
          </p>
        </div>

        {/* Signals Explainer Callout */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xs border border-stone-300 bg-white p-3.5 shadow-xs">
            <span className="font-serif font-bold text-emerald-800 text-sm">Open Story</span>
            <p className="mt-1 text-stone-600">Adds <strong>+1.0</strong> to topic & subtopic weights immediately.</p>
          </div>
          <div className="rounded-xs border border-stone-300 bg-white p-3.5 shadow-xs">
            <span className="font-serif font-bold text-rose-800 text-sm">Skip Story (✕)</span>
            <p className="mt-1 text-stone-600">Subtracts <strong>-1.0</strong> and suppresses similar coverage.</p>
          </div>
          <div className="rounded-xs border border-stone-300 bg-white p-3.5 shadow-xs">
            <span className="font-serif font-bold text-stone-700 text-sm">Scroll Past</span>
            <p className="mt-1 text-stone-600">Subtracts <strong>-0.2</strong> once per story when left unopened.</p>
          </div>
        </div>

        <div className="mt-4 rounded-xs border border-stone-300 bg-[#f4f0e6] p-4 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Your current editorial profile:</span>{" "}
          {rows.length ? `More coverage of ${rows.slice(0, 3).map((row) => row.label).join(", ")}. You can change any interest below or mute a whole topic in Settings.` : "Choose a few interests in Settings to start shaping your paper."}
        </div>

        {/* Weights List */}
        <ul className="mt-8 flex flex-col gap-3.5">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xs border border-stone-300 bg-white p-4 sm:p-5 shadow-xs transition hover:border-stone-400"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                    {r.label}
                  </span>
                  {r.subtopic && (
                    <span className="text-xs text-stone-500">
                      in {TOPIC_BY_SLUG[r.topic]?.name ?? r.topic}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Trend row={r} />
                  <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-xs">
                    weight {r.weight.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Graphical Progress Bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    r.weight >= (r.initial_weight ?? 0) ? "bg-stone-900" : "bg-rose-700"
                  }`}
                  style={{ width: `${Math.max(2, Math.min(100, (Math.max(r.weight, 0) / max) * 100))}%` }}
                />
              </div>

              {/* Action Controls & Origin */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
                <span className="text-[11px] text-stone-500">{SOURCE_LABEL[r.source]}</span>

                <div className="flex items-center gap-2">
                  <form action={correctInterest.bind(null, r.id, "more")}>
                    <SubmitButton
                      pendingLabel="Saving…"
                      className="rounded border border-stone-300 bg-[#faf8f3] px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                    >
                      + More of this
                    </SubmitButton>
                  </form>
                  <form action={correctInterest.bind(null, r.id, "less")}>
                    <SubmitButton
                      pendingLabel="Saving…"
                      className="rounded border border-stone-300 bg-[#faf8f3] px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                    >
                      - Less of this
                    </SubmitButton>
                  </form>
                  <form action={removeInterest.bind(null, r.id)}>
                    <SubmitButton
                      pendingLabel="Removing…"
                      className="rounded border border-stone-200 px-2.5 py-1 text-xs text-rose-700 transition hover:bg-rose-50 hover:text-rose-900"
                    >
                      Remove
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}

          {!rows.length && (
            <li className="rounded border border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
              No interests recorded yet. Select topics in Settings to begin tailoring your paper.
            </li>
          )}
        </ul>

        {/* Reset Action */}
        <div className="mt-10 border-t border-stone-300 pt-6">
          <form action={resetToOnboarding}>
            <SubmitButton
              pendingLabel="Resetting your interests…"
              className="rounded-xs border border-stone-400 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-800 shadow-xs transition hover:bg-stone-100 active:scale-98"
            >
              Reset to my onboarding choices
            </SubmitButton>
          </form>
        </div>
      </main>
    </>
  );
}
