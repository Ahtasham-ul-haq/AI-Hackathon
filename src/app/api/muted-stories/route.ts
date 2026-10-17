import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ storyId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: links, error: linksError } = await db.from("story_articles").select("article_id").eq("story_id", parsed.data.storyId);
  if (linksError || !links?.length) return NextResponse.json({ error: "story not found" }, { status: 404 });
  const { error } = await db.from("muted_articles").upsert(links.map(({ article_id }) => ({ user_id: user.id, article_id })), { onConflict: "user_id,article_id" });
  if (error) return NextResponse.json({ error: "could not mute story" }, { status: 403 });
  return NextResponse.json({ ok: true });
}
