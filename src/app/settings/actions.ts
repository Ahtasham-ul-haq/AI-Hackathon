"use server";

import { revalidatePath } from "next/cache";
import { requireReader } from "@/lib/auth";
import { parsePicker, setChosenInterests } from "@/lib/interests";

export type SettingsState = { error?: string; message?: string } | undefined;

export async function saveTopics(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const { supabase, user } = await requireReader();
  const picked = parsePicker(formData);
  if (!picked.length) return { error: "Keep at least one topic." };
  try {
    await setChosenInterests(supabase, user.id, picked);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/settings");
  return { message: "Saved. Your changes apply from tomorrow morning's paper." };
}
