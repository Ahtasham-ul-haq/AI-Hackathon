import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ storyId: z.string().uuid(), saved: z.boolean() });

export async function POST(request: NextRequest) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await createClient();
  const { storyId, saved } = parsed.data;
  const result = saved
    ? await db.from("saved_stories").upsert({ user_id: user.id, story_id: storyId }, { onConflict: "user_id,story_id" })
    : await db.from("saved_stories").delete().eq("user_id", user.id).eq("story_id", storyId);
  if (result.error) return NextResponse.json({ error: "could not update saved story" }, { status: 403 });
  return NextResponse.json({ ok: true, saved });
}
