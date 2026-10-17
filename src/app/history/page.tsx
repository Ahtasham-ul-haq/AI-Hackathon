import Link from "next/link";
import { requireReader } from "@/lib/auth";
import { formatPaperDate } from "@/lib/time";
import { SiteHeader } from "@/components/SiteHeader";
import { DatePicker } from "./DatePicker";
import { PdfButton } from "@/components/paper/PdfButton";

export default async function HistoryPage() {
  const { supabase, user, profile } = await requireReader();
  const { data: papers } = await supabase
    .from("papers")
    .select("id, local_date, status")
    .eq("user_id", user.id)
    .order("local_date", { ascending: false })
    .limit(14);
  const { data: oldest } = await supabase
    .from("papers").select("local_date").eq("user_id", user.id).order("local_date", { ascending: true }).limit(1);

  return (
    <>
      <SiteHeader email={profile.email} />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl font-bold">Past editions</h1>
        <p className="mt-1 text-stone-600">Every paper is kept. Recent ones are below; use the date picker for older ones.</p>
        <DatePicker min={oldest?.[0]?.local_date} max={papers?.[0]?.local_date} />
        <ul className="mt-6 divide-y divide-stone-300 border-y border-stone-300">
          {(papers ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <Link href={`/paper/${p.local_date}`} className="mr-auto font-serif text-lg hover:underline">
                {formatPaperDate(p.local_date)}
              </Link>
              {p.status === "plain" && <span className="text-xs text-stone-500">plain edition</span>}
              <Link href={`/paper/${p.local_date}`} className="text-sm underline">Read</Link>
              <PdfButton paperId={p.id} date={p.local_date} className="text-sm underline" />
            </li>
          ))}
          {!papers?.length && <li className="py-3 text-stone-500">No papers yet.</li>}
        </ul>
      </main>
    </>
  );
}
