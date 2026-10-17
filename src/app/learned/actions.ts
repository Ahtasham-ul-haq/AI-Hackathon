"use server";

import { revalidatePath } from "next/cache";
import { requireReader } from "@/lib/auth";
import { setChosenInterests } from "@/lib/interests";

export async function removeInterest(id: string) {
  const { supabase, user } = await requireReader();
  await supabase.from("interest_weights").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/learned");
}

/** Reader correction: "more of this" / "less of this". */
export async function correctInterest(id: string, direction: "more" | "less") {
  const { supabase, user } = await requireReader();
  const { data } = await supabase
    .from("interest_weights").select("topic, subtopic, label").eq("id", id).eq("user_id", user.id).single();
  if (!data) return;
  await supabase.rpc("bump_weight", {
    p_topic: data.topic,
    p_subtopic: data.subtopic,
    p_label: data.label,
    p_delta: direction === "more" ? 1.5 : -1.5,
  });
  revalidatePath("/learned");
}

export async function resetToOnboarding() {
  const { supabase, user, profile } = await requireReader();
  const base = profile.baseline_interests;
  if (!base) return;
  await supabase.from("interest_weights").delete().eq("user_id", user.id);
  await setChosenInterests(supabase, user.id, base.picked, base.note);
  revalidatePath("/learned");
}
