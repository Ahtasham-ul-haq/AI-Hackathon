import "server-only";
import Parser from "rss-parser";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TOPIC_BY_SLUG } from "@/lib/topics";

// We store only headline, snippet, source name, publish date, image URL, link.
export type Article = {
  id: string;
  url: string;
  title: string;
  snippet: string | null;
  source_name: string;
  published_at: string | null;
  image_url: string | null;
  topic: string | null;
};

type Feed = { id: string; source: string; url: string; topic: string };

export const FEEDS: Feed[] = [
  { id: "bbc-world", source: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml", topic: "world" },
  { id: "bbc-business", source: "BBC News", url: "https://feeds.bbci.co.uk/news/business/rss.xml", topic: "business" },
  { id: "bbc-tech", source: "BBC News", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", topic: "technology" },
  { id: "bbc-science", source: "BBC News", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", topic: "science" },
  { id: "bbc-health", source: "BBC News", url: "https://feeds.bbci.co.uk/news/health/rss.xml", topic: "health" },
  { id: "bbc-ents", source: "BBC News", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", topic: "entertainment" },
  { id: "bbc-sport", source: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", topic: "sports" },
  { id: "guardian-world", source: "The Guardian", url: "https://www.theguardian.com/world/rss", topic: "world" },
  { id: "guardian-politics", source: "The Guardian", url: "https://www.theguardian.com/politics/rss", topic: "politics" },
  { id: "guardian-business", source: "The Guardian", url: "https://www.theguardian.com/business/rss", topic: "economy" },
  { id: "guardian-tech", source: "The Guardian", url: "https://www.theguardian.com/uk/technology/rss", topic: "technology" },
  { id: "guardian-science", source: "The Guardian", url: "https://www.theguardian.com/science/rss", topic: "science" },
  { id: "guardian-environment", source: "The Guardian", url: "https://www.theguardian.com/environment/rss", topic: "environment" },
  { id: "guardian-sport", source: "The Guardian", url: "https://www.theguardian.com/sport/rss", topic: "sports" },
  { id: "guardian-culture", source: "The Guardian", url: "https://www.theguardian.com/culture/rss", topic: "culture" },
  { id: "guardian-education", source: "The Guardian", url: "https://www.theguardian.com/education/rss", topic: "education" },
  { id: "npr-news", source: "NPR", url: "https://feeds.npr.org/1001/rss.xml", topic: "politics" },
  { id: "dawn", source: "Dawn", url: "https://www.dawn.com/feeds/home", topic: "world" },
  { id: "cricinfo", source: "ESPNcricinfo", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", topic: "sports" },
  { id: "verge", source: "The Verge", url: "https://www.theverge.com/rss/index.xml", topic: "technology" },
  { id: "techcrunch", source: "TechCrunch", url: "https://techcrunch.com/feed/", topic: "technology" },
  { id: "sciencedaily", source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/all.xml", topic: "science" },
];

const CACHE_MS = 60 * 60 * 1000; // 1 hour
const WINDOW_MS = 48 * 60 * 60 * 1000;

type RssItem = {
  link?: string;
  title?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  "content:encoded"?: string;
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string; medium?: string } }[];
  mediaThumb?: { $?: { url?: string } };
};

const parser: Parser<object, RssItem> = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "PersonalMorningPaper/1.0 (+RSS reader)" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumb"],
    ],
  },
});

export function cleanText(s: string | null | undefined, max = 500) {
  if (!s) return null;
  const t = s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
}

function imageOf(item: RssItem): string | null {
  const fromMedia = item.mediaContent?.find((m) => m.$?.url && m.$?.medium !== "video")?.$?.url;
  const fromEnclosure = item.enclosure?.type?.startsWith("image") || !item.enclosure?.type ? item.enclosure?.url : undefined;
  const html = item["content:encoded"] ?? item.content ?? "";
  const fromHtml = /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1];
  const url = fromMedia ?? item.mediaThumb?.$?.url ?? fromEnclosure ?? fromHtml;
  return url && url.startsWith("https://") ? url : null;
}

/** Strip tracking params and fragments so the same story URL dedupes. */
export function normalizeUrl(raw: string) {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    [...u.searchParams.keys()].forEach((k) => {
      if (/^(utm_|fbclid|gclid|at_|ref$|cmp$|CMP$|ito$)/.test(k)) u.searchParams.delete(k);
    });
    return u.toString();
  } catch {
    return raw.trim();
  }
}

async function isFresh(db: SupabaseClient, key: string) {
  const { data } = await db.from("fetch_cache").select("fetched_at").eq("key", key).maybeSingle();
  return !!data && Date.now() - new Date(data.fetched_at).getTime() < CACHE_MS;
}

async function markFetched(db: SupabaseClient, key: string) {
  await db.from("fetch_cache").upsert({ key, fetched_at: new Date().toISOString() });
}

type NewArticle = Omit<Article, "id"> & { fetched_via: "rss" | "gnews" };

async function saveArticles(db: SupabaseClient, rows: NewArticle[]) {
  const cutoff = Date.now() - WINDOW_MS;
  const unique = new Map<string, NewArticle>();
  for (const r of rows) {
    if (!r.url || !r.title) continue;
    if (r.published_at && new Date(r.published_at).getTime() < cutoff) continue;
    unique.set(r.url, r);
  }
  if (!unique.size) return;
  const { error } = await db
    .from("articles")
    .upsert([...unique.values()], { onConflict: "url", ignoreDuplicates: true });
  if (error) console.error("saveArticles", error.message);
}

async function refreshFeed(db: SupabaseClient, feed: Feed) {
  const key = `rss:${feed.id}`;
  if (await isFresh(db, key)) return;
  try {
    const parsed = await parser.parseURL(feed.url);
    await saveArticles(
      db,
      parsed.items.slice(0, 40).map((it) => ({
        url: normalizeUrl(it.link ?? ""),
        title: cleanText(it.title, 300) ?? "",
        snippet: cleanText(it.contentSnippet ?? it.content),
        source_name: feed.source,
        published_at: it.isoDate ?? null,
        image_url: imageOf(it),
        topic: feed.topic,
        fetched_via: "rss",
      })),
    );
    await markFetched(db, key);
  } catch (e) {
    console.error(`RSS ${feed.id} failed:`, (e as Error).message);
  }
}

type GNewsArticle = {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string };
};

/** One GNews search, cached for an hour under `key`. Free plan: ~100 calls/day. */
async function refreshGnews(
  db: SupabaseClient,
  key: string,
  q: string,
  topic: string,
  opts: { lang: string; country: string | null },
): Promise<boolean> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey || (await isFresh(db, key))) return false;
  const params = new URLSearchParams({
    q,
    lang: opts.lang,
    max: "10",
    sortby: "publishedAt",
    from: new Date(Date.now() - WINDOW_MS).toISOString().replace(/\.\d+Z$/, "Z"),
    apikey: apiKey,
  });
  if (opts.country) params.set("country", opts.country);
  try {
    const res = await fetch(`https://gnews.io/api/v4/search?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { articles?: GNewsArticle[] };
    await saveArticles(
      db,
      (body.articles ?? []).map((a) => ({
        url: normalizeUrl(a.url),
        title: cleanText(a.title, 300) ?? "",
        snippet: cleanText(a.description),
        source_name: a.source?.name || new URL(a.url).hostname.replace(/^www\./, ""),
        published_at: a.publishedAt,
        image_url: a.image?.startsWith("https://") ? a.image : null,
        topic,
        fetched_via: "gnews",
      })),
    );
    await markFetched(db, key);
  } catch (e) {
    console.error(`GNews ${key} failed:`, (e as Error).message);
  }
  return true;
}

export type ReaderNewsPrefs = {
  topics: string[]; // reader's topic slugs, strongest first
  subtopics: { topic: string; label: string }[]; // strongest first
  language: string;
  region: string | null; // ISO country code for GNews, null = worldwide
};

/** Refresh RSS + GNews caches the reader needs. Each source refreshes at most hourly. */
export async function refreshNews(db: SupabaseClient, prefs: ReaderNewsPrefs) {
  const topics = new Set(prefs.topics);
  prefs.topics.forEach((t) => TOPIC_BY_SLUG[t]?.related.forEach((r) => topics.add(r)));
  const feeds = FEEDS.filter((f) => topics.has(f.topic) || f.topic === "world");
  const opts = { lang: prefs.language || "en", country: prefs.region };
  const geo = `${opts.lang}:${opts.country ?? "any"}`;

  const searches: [key: string, q: string, topic: string][] = [];
  for (const slug of prefs.topics.slice(0, 5)) {
    const t = TOPIC_BY_SLUG[slug];
    if (t) searches.push([`gnews:${slug}:${geo}`, t.query, slug]);
  }
  // One extra search for the reader's strongest subtopics (shared cache per exact query).
  const subs = prefs.subtopics.slice(0, 3);
  if (subs.length) {
    const q = subs.map((s) => `"${s.label.replace(/"/g, "")}"`).join(" OR ");
    searches.push([`gnews:q:${q.toLowerCase()}:${geo}`, q, subs[0].topic]);
  }
  // GNews rejects bursts (HTTP 429), so searches run one at a time while RSS runs in parallel.
  const gnews = (async () => {
    for (const [key, q, topic] of searches) {
      if (await refreshGnews(db, key, q, topic, opts)) await new Promise((r) => setTimeout(r, 1100));
    }
  })();
  await Promise.all([...feeds.map((f) => refreshFeed(db, f)), gnews]);
}

const STOP = new Set(["the", "a", "an", "of", "to", "in", "on", "for", "and", "as", "at", "is", "with", "by", "after", "says", "new"]);

function titleTokens(title: string) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  );
}

function similar(a: Set<string>, b: Set<string>) {
  let inter = 0;
  a.forEach((w) => b.has(w) && inter++);
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

/** Remove duplicate URLs and near-identical headlines (keeps the one with an image). */
export function dedupeArticles<T extends Pick<Article, "url" | "title" | "image_url">>(items: T[]): T[] {
  const kept: { item: T; tokens: Set<string> }[] = [];
  const urls = new Set<string>();
  for (const item of items) {
    const url = normalizeUrl(item.url);
    if (urls.has(url)) continue;
    urls.add(url);
    const tokens = titleTokens(item.title);
    const dupe = kept.find((k) => similar(k.tokens, tokens) >= 0.75);
    if (dupe) {
      if (!dupe.item.image_url && item.image_url) dupe.item = item;
      continue;
    }
    kept.push({ item, tokens });
  }
  return kept.map((k) => k.item);
}

export type Candidate = Article & { related: boolean };

/**
 * ~40-60 recent candidates for one reader, balanced by interest weight, with
 * about 1 in 5 slots reserved for lower-weighted and related topics.
 */
export async function gatherCandidates(
  db: SupabaseClient,
  prefs: ReaderNewsPrefs & { weights: Record<string, number>; avoidedSources: string[] },
  target = 55,
): Promise<Candidate[]> {
  const related = new Set<string>();
  prefs.topics.forEach((t) => TOPIC_BY_SLUG[t]?.related.forEach((r) => !prefs.topics.includes(r) && related.add(r)));
  const wanted = [...prefs.topics, ...related];

  const { data } = await db
    .from("articles")
    .select("id, url, title, snippet, source_name, published_at, image_url, topic")
    .in("topic", wanted)
    .gte("published_at", new Date(Date.now() - WINDOW_MS).toISOString())
    .order("published_at", { ascending: false })
    .limit(600);

  const avoided = prefs.avoidedSources.map((s) => s.toLowerCase());
  const pool = dedupeArticles(
    ((data ?? []) as Article[]).filter((a) => !avoided.some((s) => a.source_name.toLowerCase().includes(s))),
  );

  // Subtopic matches float to the top of their topic.
  const subLabels = prefs.subtopics.map((s) => s.label.toLowerCase());
  const score = (a: Article) =>
    subLabels.some((l) => `${a.title} ${a.snippet ?? ""}`.toLowerCase().includes(l)) ? 1 : 0;

  const byTopic = new Map<string, Article[]>();
  for (const a of pool) {
    const list = byTopic.get(a.topic ?? "") ?? [];
    list.push(a);
    byTopic.set(a.topic ?? "", list);
  }
  byTopic.forEach((list) => list.sort((x, y) => score(y) - score(x)));

  const mainSlots = Math.round(target * 0.8);
  const total = prefs.topics.reduce((s, t) => s + Math.max(prefs.weights[t] ?? 1, 0.5), 0) || 1;
  const picked: Candidate[] = [];
  const take = (topic: string, n: number, isRelated: boolean) => {
    const list = byTopic.get(topic) ?? [];
    picked.push(...list.splice(0, n).map((a) => ({ ...a, related: isRelated })));
  };
  for (const t of prefs.topics) {
    take(t, Math.max(3, Math.round((mainSlots * Math.max(prefs.weights[t] ?? 1, 0.5)) / total)), false);
  }
  // Reserve: weakest reader topics first, then related topics.
  const weakest = [...prefs.topics].sort((a, b) => (prefs.weights[a] ?? 0) - (prefs.weights[b] ?? 0));
  const reserve = [...weakest.slice(0, 2), ...related];
  let i = 0;
  while (picked.length < target && reserve.some((t) => (byTopic.get(t)?.length ?? 0) > 0) && i < 200) {
    const t = reserve[i++ % reserve.length];
    take(t, 1, related.has(t));
  }
  return picked.slice(0, Math.max(target, 40));
}
