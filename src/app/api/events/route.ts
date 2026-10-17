import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TOPIC_BY_SLUG } from "@/lib/topics";

const DELTA = { open: 1.0, skip: -1.0, scroll_past: -0.2 } as const;

const Body = z.object({ storyId: z.string().uuid(), kind: z.enum(["open", "skip", "scroll_past"]) });

// Records a reading event and updates the reader's interest weights immediately.
export async function POST(request: NextRequest) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { storyId, kind } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS only lets readers log events on stories from their own papers.
  const { error } = await supabase.from("reading_events").insert({ user_id: user.id, story_id: storyId, kind });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true }); // once per story per kind
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }

  const { data: story } = await supabase.from("stories").select("topics, subtopics").eq("id", storyId).single();
  if (!story) return NextResponse.json({ ok: true });

  const delta = DELTA[kind];
  const updates: PromiseLike<unknown>[] = [];
  for (const topic of (story.topics as string[]).filter((t) => TOPIC_BY_SLUG[t])) {
    updates.push(
      supabase.rpc("bump_weight", { p_topic: topic, p_subtopic: "", p_label: TOPIC_BY_SLUG[topic].name, p_delta: delta }),
    );
    for (const sub of story.subtopics as string[]) {
      // Subtopics only move if the reader already has them (any topic the story touches).
      updates.push(
        supabase
          .from("interest_weights")
          .select("topic, subtopic, label")
          .eq("user_id", user.id)
          .eq("topic", topic)
          .ilike("subtopic", sub)
          .maybeSingle()
          .then(({ data }) =>
            data
              ? supabase.rpc("bump_weight", { p_topic: data.topic, p_subtopic: data.subtopic, p_label: data.label, p_delta: delta })
              : null,
          ),
      );
    }
  }
  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
