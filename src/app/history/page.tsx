import Link from "next/link";
import { requireReader } from "@/lib/auth";
import { formatPaperDate } from "@/lib/time";
import { SiteHeader } from "@/components/SiteHeader";
import { DatePicker } from "./DatePicker";
import { PdfButton } from "@/components/paper/PdfButton";
import { EditorialPageHeader } from "@/components/EditorialPageHeader";

export default async function HistoryPage() {
  const { supabase, user, profile } = await requireReader();
  const { data: papers } = await supabase
    .from("papers")
    .select("id, local_date, status")
    .eq("user_id", user.id)
    .order("local_date", { ascending: false })
    .limit(14);
  const { data: oldest } = await supabase
    .from("papers")
    .select("local_date")
    .eq("user_id", user.id)
    .order("local_date", { ascending: true })
    .limit(1);

  return (
    <>
      <SiteHeader email={profile.email} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        <EditorialPageHeader title="Past editions" description="Revisit a previous day's paper in the web reader or download its print-ready edition." />

        {/* Date Filter & Search Box */}
        <div className="mt-8 rounded-xs border border-stone-300 bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900">Look up any issue</h2>
              <p className="text-xs text-stone-500">
                Choose a specific calendar day to jump directly to that date&apos;s paper.
              </p>
            </div>
            <DatePicker min={oldest?.[0]?.local_date} max={papers?.[0]?.local_date} />
          </div>
        </div>

        {/* Recent Archive List */}
        <div className="mt-8">
          <h2 className="font-serif text-lg font-bold text-stone-950 border-b border-stone-300 pb-2">
            Recent Editions
          </h2>

          <ul className="mt-4 divide-y divide-stone-200 border-b border-stone-200 bg-white shadow-xs rounded-xs overflow-hidden">
            {(papers ?? []).map((p) => (
              <li
                key={p.id}
                className="group flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-stone-50 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-stone-500 group-hover:text-stone-700">
                    {p.local_date}
                  </span>
                  <Link
                    href={`/paper/${p.local_date}`}
                    className="font-serif text-lg font-bold text-stone-900 hover:underline group-hover:text-stone-950 sm:text-xl"
                  >
                    {formatPaperDate(p.local_date)}
                  </Link>
                  {p.status === "plain" && (
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] uppercase font-semibold text-stone-600">
                      plain wire edition
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                  <Link
                    href={`/paper/${p.local_date}`}
                    className="rounded border border-stone-300 bg-white px-3 py-1.5 text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  >
                    Read Edition →
                  </Link>
                  <PdfButton
                    paperId={p.id}
                    date={p.local_date}
                    className="text-stone-500 hover:text-stone-950 underline underline-offset-2"
                  />
                </div>
              </li>
            ))}

            {!papers?.length && (
              <li className="p-8 text-center text-sm text-stone-500">
                No past editions found yet. Your daily paper will appear here after tomorrow&apos;s morning run.
              </li>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
