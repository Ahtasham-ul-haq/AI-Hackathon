import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateJson, type Provider } from "@/lib/ai";
import { gatherCandidates, refreshNews, type Candidate } from "@/lib/news";
import { createServiceClient } from "@/lib/supabase/server";
import { TOPIC_BY_SLUG } from "@/lib/topics";
import { addDays, localDate } from "@/lib/time";
import type { Profile } from "@/lib/auth";

export type Trigger = "onboarding" | "hourly" | "visit" | "builder";

const STALE_RUN_MS = 3 * 60 * 1000;
const LENGTH = { short: [10, 12], standard: [15, 20], long: [22, 25] } as const;

type Weight = { topic: string; subtopic: string; label: string; weight: number };

type DraftStory = {
  headline: string;
  briefing: string;
  ai_written: boolean;
  topics: string[];
  subtopics: string[];
  is_related: boolean;
  sources_disagree: boolean;
  articles: Candidate[];
};
type DraftSection = { name: string; stories: DraftStory[] };

// ---------------------------------------------------------------- claim ---

/**
 * Claims (user, local_date). Returns false if another run owns it or the paper
 * exists. Failed or stale runs without a paper can be re-claimed (on-visit retry).
 */
async function claim(db: SupabaseClient, userId: string, date: string, trigger: Trigger) {
  const { error } = await db.from("generation_runs").insert({ user_id: userId, local_date: date, trigger });
  if (!error) return true;
  if (error.code !== "23505") throw new Error(error.message);

  const { data: paper } = await db.from("papers").select("id").eq("user_id", userId).eq("local_date", date).maybeSingle();
  if (paper) return false;
  const { data: run } = await db
    .from("generation_runs").select("status, started_at, finished_at").eq("user_id", userId).eq("local_date", date).single();
  if (!run) return false;
  const stale = run.status === "running" && Date.now() - new Date(run.started_at).getTime() > STALE_RUN_MS;
  // Back off a minute after a failure so page refreshes don't hammer the providers.
  const retryable = run.status === "failed" && Date.now() - new Date(run.finished_at ?? run.started_at).getTime() > 60_000;
  if (!retryable && !stale) return false;
  // Conditional update so only one retry wins.
  const { data: won } = await db
    .from("generation_runs")
    .update({ status: "running", trigger, started_at: new Date().toISOString(), error: null, finished_at: null })
    .eq("user_id", userId).eq("local_date", date).eq("started_at", run.started_at)
    .select("id");
  return !!won?.length;
}

// ---------------------------------------------------------------- editor ---

const EditorSchema = z.object({
  sections: z
    .array(
      z.object({
        name: z.string().describe("Short newspaper section name, e.g. 'Front Page', 'Tech & AI', 'Cricket'"),
        stories: z.array(
          z.object({
            article_ids: z.array(z.string()).min(1).describe("Ids of articles about the SAME event, ideally from different outlets"),
            headline: z.string().describe("Neutral newspaper headline based only on the articles"),
            topics: z.array(z.string()).describe("Topic slugs this story belongs to"),
            subtopics: z.array(z.string()).describe("Matching reader subtopic labels, if any"),
            is_related: z.boolean().describe("true if this is a filler from a related topic rather than one the reader chose"),
          }),
        ),
      }),
    )
    .min(1),
});

function editorPrompt(profile: Profile, weights: Weight[], candidates: Candidate[], range: readonly [number, number]) {
  const topicLines = weights
    .filter((w) => !w.subtopic)
    .sort((a, b) => b.weight - a.weight)
    .map((w) => `- ${w.topic} (${w.label}): interest ${w.weight.toFixed(1)}`)
    .join("\n");
  const subLines = weights
    .filter((w) => w.subtopic)
    .sort((a, b) => b.weight - a.weight)
    .map((w) => `- ${w.label} [${w.topic}]: interest ${w.weight.toFixed(1)}`)
    .join("\n");
  const articles = candidates
    .map((c, i) =>
      `a${i} | ${c.topic}${c.related ? " (related)" : ""} | ${c.source_name} | ${c.published_at?.slice(0, 16) ?? "?"} | ${c.title} — ${(c.snippet ?? "").slice(0, 160)}`)
    .join("\n");
  return `READER
Topics (higher interest = more and more prominent coverage):
${topicLines || "- none"}
Subtopics:
${subLines || "- none"}
${profile.preferred_sources.length ? `Prefers outlets: ${profile.preferred_sources.join(", ")}\n` : ""}
CANDIDATE ARTICLES (id | topic | outlet | published | headline — snippet)
${articles}

TASK
Edit this reader's morning paper. Choose ${range[0]}-${range[1]} stories in total.
- Each story is one news event. Group articles from different outlets about the same event into one story (list all their ids).
- Never use an article id in more than one story. Only use ids from the list.
- Give most space to the reader's highest-interest topics and subtopics, but keep about 1 in 5 stories for their lower-interest or related topics so they can discover things.
- If a reader topic has too few articles, fill with stories from related topics and set is_related=true.
- Create 3-6 sections with your own short names built around this reader's biggest stories, in the order a newspaper would print them; the first section is the front page with the most important stories for this reader.
- Headlines must state only what the articles say.`;
}

async function runEditor(profile: Profile, weights: Weight[], candidates: Candidate[]) {
  const range = LENGTH[profile.length] ?? LENGTH.standard;
  const { data, provider } = await generateJson({
    system: "You are the editor of a personal morning newspaper. You select and organize real news articles. You never invent facts.",
    prompt: editorPrompt(profile, weights, candidates, range),
    schema: EditorSchema,
    temperature: 0.2,
  });

  const used = new Set<number>();
  const sections: DraftSection[] = data.sections
    .map((s) => ({
      name: s.name.trim().slice(0, 40) || "News",
      stories: s.stories
        .map((st): DraftStory | null => {
          const idx = st.article_ids
            .map((id) => Number(id.replace(/^a/, "")))
            .filter((n) => Number.isInteger(n) && candidates[n] && !used.has(n));
          if (!idx.length) return null;
          idx.forEach((n) => used.add(n));
          const arts = idx.map((n) => candidates[n]);
          const topics = st.topics.filter((t) => TOPIC_BY_SLUG[t]);
          return {
            headline: st.headline.trim() || arts[0].title,
            briefing: "",
            ai_written: true,
            topics: topics.length ? topics : [arts[0].topic ?? "world"],
            subtopics: st.subtopics.slice(0, 4),
            is_related: st.is_related || arts.every((a) => a.related),
            sources_disagree: false,
            articles: arts,
          };
        })
        .filter((x): x is DraftStory => !!x),
    }))
    .filter((s) => s.stories.length);
  if (sections.reduce((n, s) => n + s.stories.length, 0) < 3) throw new Error("editor returned too few usable stories");
  return { sections: trimToMax(sections, range[1] + 2), provider };
}

function trimToMax(sections: DraftSection[], max: number) {
  let left = max;
  return sections
    .map((s) => {
      const stories = s.stories.slice(0, Math.max(left, 0));
      left -= stories.length;
      return { ...s, stories };
    })
    .filter((s) => s.stories.length);
}

// ------------------------------------------------------------- briefings ---

const BriefingSchema = z.object({
  briefings: z.array(
    z.object({
      story: z.number().int().describe("The story number given in the prompt"),
      briefing: z.string().describe("3-5 sentence briefing using only facts in the snippets"),
      sources_disagree: z.boolean(),
    }),
  ),
});

const BRIEFING_RULES = `You write short briefings for a morning newspaper from source snippets.
Rules (strict):
- State only what the source snippets say. Do not add facts, numbers, names, quotes, background or speculation from your own knowledge.
- Attribute claims to outlets when useful ("according to BBC News").
- If the outlets disagree or report different figures, say so explicitly and set sources_disagree=true.
- If the snippets are thin, write a shorter briefing rather than filling gaps.
- Plain, neutral newspaper English. 3-5 sentences.`;

async function writeBriefings(stories: DraftStory[]): Promise<Provider | null> {
  const batches: DraftStory[][] = [];
  for (let i = 0; i < stories.length; i += 5) batches.push(stories.slice(i, i + 5));
  const providers = await Promise.all(
    batches.map(async (batch) => {
      const prompt = batch
        .map((s, i) =>
          `STORY ${i}: ${s.headline}\n` +
          s.articles.map((a) => `- ${a.source_name} (${a.published_at?.slice(0, 10) ?? "undated"}): ${a.title}. ${a.snippet ?? ""}`).join("\n"))
        .join("\n\n");
      try {
        const { data, provider } = await generateJson({ system: BRIEFING_RULES, prompt, schema: BriefingSchema, temperature: 0.2 });
        for (const b of data.briefings) {
          const s = batch[b.story];
          if (s && b.briefing.trim()) {
            s.briefing = b.briefing.trim();
            s.sources_disagree = b.sources_disagree;
          }
        }
        return provider;
      } catch (e) {
        console.error("briefing batch failed:", (e as Error).message);
        return null;
      }
    }),
  );
  // Anything without a briefing falls back to the outlet's own snippet.
  for (const s of stories) {
    if (!s.briefing) {
      s.briefing = s.articles[0].snippet ?? s.articles[0].title;
      s.ai_written = false;
    }
  }
  return providers.find((p) => p) ?? null;
}

// ---------------------------------------------------------- plain edition ---

const PLAIN_NOTE =
  "Our AI editor was unavailable this morning, so this is a plain edition: the outlets' own headlines and summaries, grouped by your topics. Normal service resumes tomorrow.";

function plainEdition(weights: Weight[], candidates: Candidate[], max: number): DraftSection[] {
  const order = weights.filter((w) => !w.subtopic).sort((a, b) => b.weight - a.weight).map((w) => w.topic);
  const sections: DraftSection[] = [];
  let left = max;
  for (const topic of [...order, ...new Set(candidates.map((c) => c.topic ?? "world"))]) {
    if (left <= 0 || sections.some((s) => s.name === (TOPIC_BY_SLUG[topic]?.name ?? topic))) continue;
    const arts = candidates.filter((c) => c.topic === topic).slice(0, Math.min(5, left));
    if (!arts.length) continue;
    left -= arts.length;
    sections.push({
      name: TOPIC_BY_SLUG[topic]?.name ?? topic,
      stories: arts.map((a) => ({
        headline: a.title,
        briefing: a.snippet ?? "",
        ai_written: false,
        topics: [topic],
        subtopics: [],
        is_related: a.related,
        sources_disagree: false,
        articles: [a],
      })),
    });
  }
  return sections;
}

// ------------------------------------------------------------------ save ---

async function savePaper(
  db: SupabaseClient,
  userId: string,
  date: string,
  status: "ready" | "plain",
  note: string | null,
  sections: DraftSection[],
) {
  const { data: paper, error } = await db
    .from("papers").insert({ user_id: userId, local_date: date, status, note }).select("id").single();
  if (error) throw new Error(`save paper: ${error.message}`);
  try {
    const { data: secRows, error: secErr } = await db
      .from("sections")
      .insert(sections.map((s, i) => ({ paper_id: paper.id, name: s.name, position: i })))
      .select("id, position");
    if (secErr) throw new Error(secErr.message);
    const secId = new Map(secRows.map((r) => [r.position, r.id]));

    const flat = sections.flatMap((s, si) => s.stories.map((st) => ({ st, si })));
    const { data: storyRows, error: stErr } = await db
      .from("stories")
      .insert(
        flat.map(({ st, si }, i) => {
          const pic = st.articles.find((a) => a.image_url);
          return {
            paper_id: paper.id,
            section_id: secId.get(si),
            position: i,
            headline: st.headline,
            briefing: st.briefing,
            ai_written: st.ai_written,
            topics: st.topics,
            subtopics: st.subtopics,
            is_related: st.is_related,
            sources_disagree: st.sources_disagree,
            image_url: pic?.image_url ?? null,
            image_credit: pic?.source_name ?? null,
          };
        }),
      )
      .select("id, position");
    if (stErr) throw new Error(stErr.message);
    const links = storyRows.flatMap((r) => flat[r.position].st.articles.map((a) => ({ story_id: r.id, article_id: a.id })));
    const { error: linkErr } = await db.from("story_articles").insert(links);
    if (linkErr) throw new Error(linkErr.message);
    return paper.id as string;
  } catch (e) {
    await db.from("papers").delete().eq("id", paper.id); // keep papers all-or-nothing
    throw e;
  }
}

// ------------------------------------------------------------------ main ---

export type GenerateResult =
  | { status: "created"; paperId: string; localDate: string; provider: Provider | "plain" }
  | { status: "skipped"; reason: string };

/**
 * The one generation routine: used after onboarding, by the hourly morning run,
 * by the on-visit fallback, and by the builder-only trigger.
 */
export async function generatePaperForReader(userId: string, trigger: Trigger): Promise<GenerateResult> {
  const db = createServiceClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", userId).single<Profile>();
  if (!profile) return { status: "skipped", reason: "no profile" };
  if (!profile.onboarded) return { status: "skipped", reason: "not onboarded" };

  let date = localDate(profile.timezone);
  if (trigger === "builder") {
    // Demo: produce the next edition now, on the next date without a paper.
    const { data: latest } = await db
      .from("papers").select("local_date").eq("user_id", userId).order("local_date", { ascending: false }).limit(1);
    if (latest?.[0] && latest[0].local_date >= date) date = addDays(latest[0].local_date, 1);
  }

  if (!(await claim(db, userId, date, trigger))) return { status: "skipped", reason: "already generated or in progress" };

  try {
    const { data: weightRows } = await db
      .from("interest_weights").select("topic, subtopic, label, weight").eq("user_id", userId);
    const weights = (weightRows ?? []) as Weight[];
    const topicWeight: Record<string, number> = {};
    for (const w of weights) topicWeight[w.topic] = Math.max(topicWeight[w.topic] ?? -Infinity, w.weight);
    const topics = Object.keys(topicWeight).filter((t) => TOPIC_BY_SLUG[t]).sort((a, b) => topicWeight[b] - topicWeight[a]);
    const subtopics = weights.filter((w) => w.subtopic && w.weight > 0).sort((a, b) => b.weight - a.weight)
      .map((w) => ({ topic: w.topic, label: w.label }));

    const prefs = { topics, subtopics, language: profile.language, region: profile.region };
    await refreshNews(db, prefs);
    const candidates = await gatherCandidates(db, { ...prefs, weights: topicWeight, avoidedSources: profile.avoided_sources });
    if (!candidates.length) throw new Error("no recent articles found for this reader's topics");

    let sections: DraftSection[];
    let provider: Provider | "plain";
    let status: "ready" | "plain" = "ready";
    let note: string | null = null;
    try {
      const edited = await runEditor(profile, weights, candidates);
      sections = edited.sections;
      provider = edited.provider;
      await writeBriefings(sections.flatMap((s) => s.stories));
    } catch (e) {
      console.error("editor failed, plain edition:", (e as Error).message);
      sections = plainEdition(weights, candidates, (LENGTH[profile.length] ?? LENGTH.standard)[1]);
      provider = "plain";
      status = "plain";
      note = PLAIN_NOTE;
    }

    const paperId = await savePaper(db, userId, date, status, note, sections);
    await db.from("generation_runs")
      .update({ status: "done", provider, finished_at: new Date().toISOString() })
      .eq("user_id", userId).eq("local_date", date);
    return { status: "created", paperId, localDate: date, provider };
  } catch (e) {
    await db.from("generation_runs")
      .update({ status: "failed", error: (e as Error).message.slice(0, 1000), finished_at: new Date().toISOString() })
      .eq("user_id", userId).eq("local_date", date);
    throw e;
  }
}
