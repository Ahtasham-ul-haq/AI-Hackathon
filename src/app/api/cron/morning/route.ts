import { NextResponse, type NextRequest } from "next/server";
import { generatePaperForReader } from "@/lib/generate";
import { ensurePdf } from "@/lib/pdf";
import { createServiceClient } from "@/lib/supabase/server";
import { localDate, localHour } from "@/lib/time";

export const maxDuration = 300;

const MORNING_FROM = 5; // local hour the morning run starts trying
const MORNING_TO = 11; // keep trying through the morning if a run was missed
const BUDGET_MS = 230_000; // stop starting new work before the 300s limit
const CONCURRENCY = 2; // keep well under Gemini free-tier RPM

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

// Called hourly by GitHub Actions. Generates papers for readers whose local
// morning it is and who don't have today's paper yet, then retries failed PDFs.
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const started = Date.now();
  const db = createServiceClient();

  const { data: profiles } = await db.from("profiles").select("id, timezone").eq("onboarded", true);
  const due: string[] = [];
  for (const p of profiles ?? []) {
    const hour = localHour(p.timezone);
    if (hour < MORNING_FROM || hour > MORNING_TO) continue;
    const { data: paper } = await db
      .from("papers").select("id").eq("user_id", p.id).eq("local_date", localDate(p.timezone)).maybeSingle();
    if (!paper) due.push(p.id);
  }

  const results: Record<string, string> = {};
  const queue = [...due];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length && Date.now() - started < BUDGET_MS) {
        const id = queue.shift()!;
        try {
          const r = await generatePaperForReader(id, "hourly");
          results[id] = r.status === "created" ? `created (${r.provider})` : `skipped: ${r.reason}`;
        } catch (e) {
          results[id] = `failed: ${(e as Error).message.slice(0, 200)}`;
        }
      }
    }),
  );

  // Retry PDFs that failed to render (last 7 days).
  const pdfs: Record<string, string> = {};
  const { data: missing } = await db
    .from("papers")
    .select("id, user_id")
    .is("pdf_path", null)
    .not("pdf_failed_at", "is", null)
    .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
    .limit(10);
  for (const p of missing ?? []) {
    if (Date.now() - started > BUDGET_MS) break;
    try {
      await ensurePdf(p.user_id, p.id);
      pdfs[p.id] = "rendered";
    } catch (e) {
      pdfs[p.id] = `failed: ${(e as Error).message.slice(0, 200)}`;
    }
  }

  return NextResponse.json({ due: due.length, notStarted: queue.length, results, pdfs, ms: Date.now() - started });
}
