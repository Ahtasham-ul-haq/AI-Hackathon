"use server";

import { revalidatePath } from "next/cache";
import { requireReader } from "@/lib/auth";
import { parsePicker, setChosenInterests } from "@/lib/interests";

export type SettingsState = { error?: string; message?: string } | undefined;

export async function saveTopics(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const { supabase, user, profile } = await requireReader();
  const picked = parsePicker(formData);
  if (!picked.length) return { error: "Keep at least one topic." };
  try {
    await setChosenInterests(supabase, user.id, picked);
    // Edited topics become the new baseline for "reset"; keep note interests under kept topics.
    const note = (profile.baseline_interests?.note ?? []).filter((n) => picked.some((p) => p.topic === n.topic));
    await supabase.from("profiles").update({ baseline_interests: { picked, note } }).eq("id", user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/settings");
  return { message: "Saved. Your changes apply from tomorrow morning's paper." };
}
