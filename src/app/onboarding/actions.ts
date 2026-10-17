"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireReader } from "@/lib/auth";
import { noteToInterests, parsePicker, setChosenInterests } from "@/lib/interests";
import { generatePaperForReader } from "@/lib/generate";

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(_: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { supabase, user, profile } = await requireReader();
  const picked = parsePicker(formData);
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (!picked.length && !note) return { error: "Pick at least one topic (or tell us in a sentence what you like)." };

  const noteInterests = await noteToInterests(note);
  if (!picked.length && !noteInterests.length) {
    return { error: "We couldn't match that sentence to any topics. Pick at least one topic." };
  }
  await setChosenInterests(supabase, user.id, picked, noteInterests);

  // Google sign-ups don't pass through our sign-up form, so take the time zone here too.
  const tz = String(formData.get("timezone") ?? "");
  const update: Record<string, unknown> = { onboarded: true, interests_note: note || null };
  if (tz && profile.timezone === "UTC" && tz !== "UTC") update.timezone = tz;
  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { error: error.message };

  // First paper right away; the paper page shows progress and refreshes when ready.
  after(() => generatePaperForReader(user.id, "onboarding").catch(console.error));
  redirect("/paper");
}
