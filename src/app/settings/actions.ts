"use server";

import { revalidatePath } from "next/cache";
import { requireReader } from "@/lib/auth";
import { parsePicker, setChosenInterests } from "@/lib/interests";
import { LANGUAGES, REGIONS } from "@/lib/preferences";

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

function list(v: FormDataEntryValue | null) {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((s) => s.slice(0, 60));
}

export async function savePreferences(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const { supabase, user } = await requireReader();
  const region = String(formData.get("region") ?? "");
  const language = String(formData.get("language") ?? "en");
  const length = String(formData.get("length") ?? "standard");
  if (!REGIONS.some(([c]) => c === region) || !LANGUAGES.some(([c]) => c === language)) {
    return { error: "Unsupported region or language." };
  }
  if (!["short", "standard", "long"].includes(length)) return { error: "Unsupported length." };
  const { error } = await supabase
    .from("profiles")
    .update({
      region: region || null,
      language,
      length,
      preferred_sources: list(formData.get("preferred")),
      avoided_sources: list(formData.get("avoided")),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { message: "Saved. Your changes apply from tomorrow morning's paper." };
}
