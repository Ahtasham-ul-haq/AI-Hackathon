import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PaperSource = {
  id: string;
  url: string;
  title: string;
  source_name: string;
  published_at: string | null;
};

export type PaperStory = {
  id: string;
  position: number;
  headline: string;
  briefing: string;
  ai_written: boolean;
  topics: string[];
  subtopics: string[];
  is_related: boolean;
  sources_disagree: boolean;
  image_url: string | null;
  image_credit: string | null;
  sources: PaperSource[];
};

export type PaperSection = { id: string; name: string; position: number; stories: PaperStory[] };

export type Paper = {
  id: string;
  user_id: string;
  local_date: string;
  status: "ready" | "plain";
  note: string | null;
  pdf_path: string | null;
  created_at: string;
  sections: PaperSection[];
};

type Row = {
  id: string; user_id: string; local_date: string; status: "ready" | "plain"; note: string | null;
  pdf_path: string | null; created_at: string;
  sections: { id: string; name: string; position: number }[];
  stories: (Omit<PaperStory, "sources"> & { section_id: string; story_articles: { articles: PaperSource | null }[] })[];
};

const SELECT = `id, user_id, local_date, status, note, pdf_path, created_at,
  sections(id, name, position),
  stories(id, section_id, position, headline, briefing, ai_written, topics, subtopics, is_related,
    sources_disagree, image_url, image_credit,
    story_articles(articles(id, url, title, source_name, published_at)))`;

function shape(row: Row): Paper {
  const sections = [...row.sections].sort((a, b) => a.position - b.position).map((s) => ({
    ...s,
    stories: row.stories
      .filter((st) => st.section_id === s.id)
      .sort((a, b) => a.position - b.position)
      .map(({ story_articles, ...st }) => ({
        ...st,
        sources: story_articles
          .map((sa) => sa.articles)
          .filter((a): a is PaperSource => !!a)
          .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")),
      })),
  }));
  return { ...row, sections };
}

/** A reader's paper for a date, or their latest one. Works with a reader (RLS) or service client. */
export async function loadPaper(db: SupabaseClient, userId: string, date?: string): Promise<Paper | null> {
  let q = db.from("papers").select(SELECT).eq("user_id", userId);
  q = date ? q.eq("local_date", date) : q.order("local_date", { ascending: false }).limit(1);
  const { data } = await q.maybeSingle<Row>();
  return data ? shape(data) : null;
}

export async function skippedStoryIds(db: SupabaseClient, userId: string, paper: Paper) {
  const ids = paper.sections.flatMap((s) => s.stories.map((st) => st.id));
  if (!ids.length) return [];
  const { data } = await db
    .from("reading_events").select("story_id").eq("user_id", userId).eq("kind", "skip").in("story_id", ids);
  return (data ?? []).map((r) => r.story_id as string);
}
