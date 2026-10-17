import { NextResponse } from "next/server";
import { isBuilder } from "@/lib/auth";
import { generatePaperForReader } from "@/lib/generate";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

// Builder-only demo trigger: generates the next edition right now.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isBuilder(user.email)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    return NextResponse.json(await generatePaperForReader(user.id, "builder"));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
