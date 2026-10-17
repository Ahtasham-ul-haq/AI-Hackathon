import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePdf } from "@/lib/pdf";

export const maxDuration = 120;

export async function GET(_: NextRequest, ctx: RouteContext<"/api/papers/[id]/pdf">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", _.url));

  // RLS: readers can only see their own papers.
  const { data: paper } = await supabase.from("papers").select("id, local_date").eq("id", id).maybeSingle();
  if (!paper) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const pdf = await ensurePdf(user.id, paper.id);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="morning-paper-${paper.local_date}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("PDF render failed", e);
    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><title>PDF is being prepared</title>
<body style="font-family:Georgia,serif;max-width:32rem;margin:6rem auto;padding:0 1rem;text-align:center">
<h1>PDF is being prepared</h1><p>Your web edition is ready to read now. We'll keep working on the PDF; try again in a little while.</p>
<p><a href="/paper/${paper.local_date}">Back to the paper</a></p></body>`,
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "600" } },
    );
  }
}
