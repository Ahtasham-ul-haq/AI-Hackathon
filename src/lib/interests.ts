import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateJson } from "@/lib/ai";
import { START_WEIGHT, TOPICS, TOPIC_BY_SLUG } from "@/lib/topics";

export type Interest = { topic: string; subtopic: string; label: string };

const NoteSchema = z.object({
  interests: z
    .array(
      z.object({
        topic: z.string().describe("One of the allowed topic slugs"),
        subtopic: z.string().describe("A short 1-4 word subtopic label, e.g. 'Formula 1' or 'Pakistani cricket'"),
      }),
    )
    .max(6),
});

/** Turns the reader's one optional sentence into topic/subtopic interests. */
export async function noteToInterests(note: string): Promise<Interest[]> {
  const text = note.trim().slice(0, 300);
  if (!text) return [];
  const allowed = TOPICS.map((t) => `${t.slug} (${t.name}: ${t.subtopics.join(", ")})`).join("\n");
  try {
    const { data } = await generateJson({
      system:
        "You map a newspaper reader's description of their interests to news topics. " +
        "Only use the allowed topic slugs. Prefer the listed subtopics when one fits; otherwise write a short, " +
        "specific subtopic label taken from the reader's words. Return at most 6 interests. Never invent interests the reader did not express.",
      prompt: `Allowed topics:\n${allowed}\n\nReader's sentence: """${text}"""`,
      schema: NoteSchema,
      temperature: 0.1,
    });
    return dedupe(
      data.interests
        .filter((i) => TOPIC_BY_SLUG[i.topic] && i.subtopic.trim())
        .map((i) => ({ topic: i.topic, subtopic: i.subtopic.trim().slice(0, 40), label: i.subtopic.trim().slice(0, 40) })),
    );
  } catch {
    // Both providers failed: fall back to matching listed subtopic names.
    // Whole words only ("Art" must not match "startups"). Subtopic names have no regex metacharacters.
    const mentions = (s: string) => new RegExp(`\\b${s}\\b`, "i").test(text);
    return TOPICS.flatMap((t) =>
      t.subtopics.filter(mentions).map((s) => ({ topic: t.slug, subtopic: s, label: s })),
    );
  }
}

function dedupe(items: Interest[]) {
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.topic}::${i.subtopic.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Parse topic + "slug::Subtopic" checkbox values from the picker form. */
export function parsePicker(formData: FormData): Interest[] {
  const topics = formData.getAll("topic").map(String).filter((s) => TOPIC_BY_SLUG[s]);
  const subs = formData
    .getAll("sub")
    .map(String)
    .map((v) => v.split("::"))
    .filter(([slug, sub]) => topics.includes(slug) && TOPIC_BY_SLUG[slug].subtopics.includes(sub));
  return [
    ...topics.map((slug) => ({ topic: slug, subtopic: "", label: TOPIC_BY_SLUG[slug].name })),
    ...subs.map(([slug, sub]) => ({ topic: slug, subtopic: sub, label: sub })),
  ];
}

/**
 * Makes the reader's chosen interests match `wanted`. Kept items keep their
 * learned weight; new ones start at 3.0 and become the onboarding baseline.
 * Interests the reader dropped are removed (including learned ones under a dropped topic).
 */
export async function setChosenInterests(
  supabase: SupabaseClient,
  userId: string,
  wanted: Interest[],
  noteInterests: Interest[] = [],
) {
  const { data: existing } = await supabase
    .from("interest_weights")
    .select("id, topic, subtopic, source")
    .eq("user_id", userId);
  const key = (t: string, s: string) => `${t}::${s.toLowerCase()}`;
  const all = dedupe([...wanted, ...noteInterests]);
  // A note-derived interest whose topic wasn't picked still brings its topic in.
  for (const n of noteInterests) {
    if (!all.some((i) => i.topic === n.topic && i.subtopic === "")) {
      all.push({ topic: n.topic, subtopic: "", label: TOPIC_BY_SLUG[n.topic].name });
    }
  }
  const noteKeys = new Set(noteInterests.map((i) => key(i.topic, i.subtopic)));
  const wantedKeys = new Set(all.map((i) => key(i.topic, i.subtopic)));
  const wantedTopics = new Set(all.map((i) => i.topic));
  const existingKeys = new Set((existing ?? []).map((e) => key(e.topic, e.subtopic)));

  const toDelete = (existing ?? []).filter((e) =>
    e.source === "onboarding" ? !wantedKeys.has(key(e.topic, e.subtopic)) : !wantedTopics.has(e.topic),
  );
  if (toDelete.length) {
    await supabase.from("interest_weights").delete().in("id", toDelete.map((e) => e.id));
  }

  const rows = all
    .filter((i) => !existingKeys.has(key(i.topic, i.subtopic)))
    .map((i) => ({
      user_id: userId,
      topic: i.topic,
      subtopic: i.subtopic,
      label: i.label,
      weight: START_WEIGHT,
      initial_weight: START_WEIGHT,
      source: noteKeys.has(key(i.topic, i.subtopic)) ? "note" : "onboarding",
    }));
  if (rows.length) {
    const { error } = await supabase.from("interest_weights").upsert(rows, { onConflict: "user_id,topic,subtopic" });
    if (error) throw new Error(error.message);
  }
}
