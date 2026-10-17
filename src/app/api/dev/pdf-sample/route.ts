import { NextResponse, type NextRequest } from "next/server";
import { renderPaperPdf } from "@/lib/pdf";
import type { Paper, PaperStory } from "@/lib/papers";

// Development only: renders a sample paper so the PDF layout can be checked without keys.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "not found" }, { status: 404 });
  const img = request.nextUrl.searchParams.get("img");
  const story = (i: number, withImg: boolean): PaperStory => ({
    id: `s${i}`, position: i, headline: `Sample headline number ${i} about an important event today`,
    briefing: "According to BBC News, officials confirmed the plan on Thursday. The Guardian reported that the timeline remains unclear. Both outlets said further details are expected next week. ".repeat(i === 0 ? 2 : 1),
    ai_written: i % 4 !== 3, topics: ["world"], subtopics: [], is_related: i === 5, sources_disagree: i === 2,
    image_url: withImg ? img : null, image_credit: withImg && img ? "BBC News" : null,
    sources: [
      { id: `a${i}`, url: "https://www.bbc.co.uk/news", title: "t", source_name: "BBC News", published_at: new Date().toISOString() },
      { id: `b${i}`, url: "https://www.theguardian.com", title: "t", source_name: "The Guardian", published_at: new Date().toISOString() },
    ],
  });
  const paper: Paper = {
    id: "p1", user_id: "u1", local_date: "2026-10-17", status: "ready", note: null, pdf_path: null, pdf_failed_at: null, created_at: "",
    sections: [
      { id: "x1", name: "Front Page", position: 0, stories: [0, 1, 2, 3].map((i) => story(i, i < 2)) },
      { id: "x2", name: "Tech & AI", position: 1, stories: [4, 5, 6, 7, 8].map((i) => story(i, i === 4)) },
      { id: "x3", name: "Cricket", position: 2, stories: [9, 10, 11].map((i) => story(i, false)) },
    ],
  };
  const pdf = await renderPaperPdf(paper, "Sample Reader");
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
}
