import "server-only";
import { Document, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { createServiceClient } from "@/lib/supabase/server";
import { loadPaper, type Paper, type PaperStory } from "@/lib/papers";
import { formatPaperDate } from "@/lib/time";

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 36, paddingHorizontal: 32, fontFamily: "Times-Roman", fontSize: 9.5, color: "#111" },
  mastTop: { flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, textTransform: "uppercase", letterSpacing: 1 },
  masthead: { fontFamily: "Times-Bold", fontSize: 44, textAlign: "center", marginTop: 4, letterSpacing: -0.5 },
  rule: { borderBottomWidth: 2, borderBottomColor: "#111", marginTop: 4 },
  thinRule: { borderBottomWidth: 0.5, borderBottomColor: "#111", marginTop: 2, marginBottom: 2 },
  dateline: { flexDirection: "row", justifyContent: "space-between", fontSize: 8, paddingVertical: 3 },
  note: { borderWidth: 0.5, borderColor: "#555", padding: 6, marginTop: 8, fontSize: 8.5, fontFamily: "Times-Italic" },
  sectionHead: { fontFamily: "Helvetica-Bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 12, paddingBottom: 2, borderBottomWidth: 1.5, borderBottomColor: "#111" },
  columns: { flexDirection: "row", marginTop: 6 },
  column: { flex: 1 },
  gutter: { width: 14, borderRightWidth: 0.5, borderRightColor: "#999", marginRight: 14 },
  story: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: "#bbb" },
  kicker: { fontFamily: "Helvetica", fontSize: 6.5, textTransform: "uppercase", letterSpacing: 0.8, color: "#555", marginBottom: 2 },
  headline: { fontFamily: "Times-Bold", fontSize: 13, lineHeight: 1.15, marginBottom: 3 },
  leadHeadline: { fontFamily: "Times-Bold", fontSize: 24, lineHeight: 1.1, marginBottom: 4 },
  body: { lineHeight: 1.35 },
  leadBody: { fontSize: 11, lineHeight: 1.4, textAlign: "justify" },
  photo: { width: "100%", objectFit: "cover", marginBottom: 2 },
  credit: { fontFamily: "Helvetica", fontSize: 6, color: "#666", marginBottom: 4 },
  sources: { fontFamily: "Helvetica", fontSize: 6.5, color: "#444", marginTop: 3 },
  disagree: { fontFamily: "Times-Italic", fontSize: 8.5, marginTop: 2 },
  link: { color: "#444", textDecoration: "underline" },
  footer: { position: "absolute", bottom: 16, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 6.5, color: "#666", fontFamily: "Helvetica" },
});

type Img = { data: Buffer; format: "jpg" | "png" } | null;

/** Fetch photos up front; react-pdf supports only JPEG/PNG. Failures mean no image. */
async function fetchImage(url: string | null): Promise<Img> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { "User-Agent": "Mozilla/5.0 MorningPaper" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000 || buf.length > 4_000_000) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8) return { data: buf, format: "jpg" };
    if (buf[0] === 0x89 && buf[1] === 0x50) return { data: buf, format: "png" };
    return null;
  } catch {
    return null;
  }
}

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "undated";
}

function StoryBlock({ story, img, lead }: { story: PaperStory; img: Img; lead?: boolean }) {
  return (
    <View style={s.story} wrap={!lead}>
      {img && (
        <View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img */}
          <Image src={img} style={[s.photo, { height: lead ? 190 : 95 }]} />
          {story.image_credit && <Text style={s.credit}>PHOTO: {story.image_credit.toUpperCase()}</Text>}
        </View>
      )}
      <Text style={s.kicker}>
        {story.is_related ? "Related · " : ""}
        {story.ai_written ? "AI-written summary" : "Outlet's own summary"}
      </Text>
      <Text style={lead ? s.leadHeadline : s.headline}>{story.headline}</Text>
      <Text style={lead ? s.leadBody : s.body}>{story.briefing}</Text>
      {story.sources_disagree && <Text style={s.disagree}>The outlets&apos; reports differ on some details.</Text>}
      <Text style={s.sources}>
        Sources:{" "}
        {story.sources.map((src, i) => (
          <Text key={src.id}>
            {i > 0 ? " · " : ""}
            <Link src={src.url} style={s.link}>{src.source_name}</Link> ({shortDate(src.published_at)})
          </Text>
        ))}
      </Text>
    </View>
  );
}

/** Rough height estimate to balance the two columns. */
function weight(story: PaperStory, img: Img) {
  return story.briefing.length / 4 + story.headline.length / 2 + (img ? 110 : 0) + 30;
}

function PaperDocument({ paper, images, readerName }: { paper: Paper; images: Map<string, Img>; readerName: string | null }) {
  const count = paper.sections.reduce((n, sec) => n + sec.stories.length, 0);
  return (
    <Document title={`The Morning Paper — ${paper.local_date}`} author="Personal Morning Paper">
      <Page size="A4" style={s.page}>
        <View style={s.mastTop}>
          <Text>{readerName ? `Edited for ${readerName}` : "Your personal edition"}</Text>
          <Text>{count} stories</Text>
        </View>
        <Text style={s.masthead}>The Morning Paper</Text>
        <View style={s.rule} />
        <View style={s.dateline}>
          <Text>{formatPaperDate(paper.local_date)}</Text>
          <Text>Briefings written by AI from the outlets credited with each story</Text>
        </View>
        <View style={s.thinRule} />
        {paper.note && <Text style={s.note}>{paper.note}</Text>}

        {paper.sections.map((section, si) => {
          const stories = si === 0 ? section.stories.slice(1) : section.stories;
          const cols: PaperStory[][] = [[], []];
          const h = [0, 0];
          for (const st of stories) {
            const c = h[0] <= h[1] ? 0 : 1;
            cols[c].push(st);
            h[c] += weight(st, images.get(st.id) ?? null);
          }
          return (
            <View key={section.id}>
              <Text style={s.sectionHead} minPresenceAhead={80}>{section.name}</Text>
              {si === 0 && section.stories[0] && (
                <View style={{ marginTop: 6 }}>
                  <StoryBlock story={section.stories[0]} img={images.get(section.stories[0].id) ?? null} lead />
                </View>
              )}
              <View style={s.columns}>
                <View style={s.column}>
                  {cols[0].map((st) => <StoryBlock key={st.id} story={st} img={images.get(st.id) ?? null} />)}
                </View>
                <View style={s.gutter} />
                <View style={s.column}>
                  {cols[1].map((st) => <StoryBlock key={st.id} story={st} img={images.get(st.id) ?? null} />)}
                </View>
              </View>
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text>The Morning Paper · {paper.local_date}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderPaperPdf(paper: Paper, readerName: string | null) {
  const stories = paper.sections.flatMap((sec) => sec.stories);
  const imgs = await Promise.all(stories.map((st) => fetchImage(st.image_url)));
  const images = new Map(stories.map((st, i) => [st.id, imgs[i]]));
  return renderToBuffer(<PaperDocument paper={paper} images={images} readerName={readerName} />);
}

/**
 * Returns the cached PDF for a paper, rendering and caching it on first request.
 * The PDF is always the complete edition (skips are web-only).
 */
export async function ensurePdf(userId: string, paperId: string): Promise<Buffer> {
  const db = createServiceClient();
  const { data: row } = await db
    .from("papers").select("local_date, pdf_path").eq("id", paperId).eq("user_id", userId).single();
  if (!row) throw new Error("paper not found");

  if (row.pdf_path) {
    const { data } = await db.storage.from("papers").download(row.pdf_path);
    if (data) return Buffer.from(await data.arrayBuffer());
  }

  try {
    const paper = await loadPaper(db, userId, row.local_date);
    if (!paper) throw new Error("paper not found");
    const { data: profile } = await db.from("profiles").select("display_name").eq("id", userId).single();
    const pdf = await renderPaperPdf(paper, profile?.display_name ?? null);
    const path = `${userId}/${row.local_date}-${paperId.slice(0, 8)}.pdf`;
    const { error } = await db.storage.from("papers").upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (!error) await db.from("papers").update({ pdf_path: path, pdf_failed_at: null }).eq("id", paperId);
    return pdf;
  } catch (e) {
    await db.from("papers").update({ pdf_failed_at: new Date().toISOString() }).eq("id", paperId);
    throw e;
  }
}
