"use server";

import { revalidatePath } from "next/cache";
import { requireReader } from "@/lib/auth";
import { parsePicker, setChosenInterests } from "@/lib/interests";
import { LANGUAGES, REGIONS } from "@/lib/preferences";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SettingsState = { error?: string; message?: string } | undefined;

export async function saveTopics(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const { supabase, user, profile } = await requireReader();
  const picked = parsePicker(formData);
  if (!picked.length) return { error: "Keep at least one topic." };
  try {
    await setChosenInterests(supabase, user.id, picked);
    // Edited topics become the new baseline for "reset"; keep note interests under kept topics.
    const note = (profile.baseline_interests?.note ?? []).filter((n) => picked.some((p) => p.topic === n.topic));
    const selectedSlugs = new Set(picked.map((p) => p.topic));
    await supabase.from("profiles").update({
      baseline_interests: { picked, note },
      muted_topics: (profile.muted_topics ?? []).filter((slug) => selectedSlugs.has(slug)),
    }).eq("id", user.id);
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
  const discoveryRatio = Number(formData.get("discovery_ratio") ?? 20);
  const emailDelivery = formData.get("email_delivery") === "on";
  const deliveryHour = Number(formData.get("delivery_hour") ?? 7);
  if (!REGIONS.some(([c]) => c === region) || !LANGUAGES.some(([c]) => c === language)) {
    return { error: "Unsupported region or language." };
  }
  if (!["short", "standard", "long"].includes(length)) return { error: "Unsupported length." };
  if (!Number.isInteger(discoveryRatio) || discoveryRatio < 0 || discoveryRatio > 40) return { error: "Discovery must be between 0 and 40%." };
  if (!Number.isInteger(deliveryHour) || deliveryHour < 0 || deliveryHour > 23) return { error: "Choose a valid local delivery hour." };
  if (emailDelivery && (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)) {
    return { error: "Email delivery is not configured for this deployment. Add RESEND_API_KEY and EMAIL_FROM before enabling it." };
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      region: region || null,
      language,
      length,
      preferred_sources: list(formData.get("preferred")),
      avoided_sources: list(formData.get("avoided")),
      discovery_ratio: discoveryRatio,
      email_delivery: emailDelivery,
      delivery_hour: deliveryHour,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { message: "Saved. Your changes apply from tomorrow morning's paper." };
}

export async function toggleMutedTopic(topic: string) {
  const { supabase, user, profile } = await requireReader();
  const { TOPIC_BY_SLUG } = await import("@/lib/topics");
  if (!TOPIC_BY_SLUG[topic]) return;
  const muted = new Set(profile.muted_topics ?? []);
  if (!muted.has(topic)) {
    const { data: weights } = await supabase.from("interest_weights").select("topic").eq("user_id", user.id);
    const activeTopics = new Set((weights ?? []).map((row) => row.topic).filter((slug) => !muted.has(slug)));
    if (activeTopics.size <= 1 && activeTopics.has(topic)) return;
  }
  if (muted.has(topic)) muted.delete(topic); else muted.add(topic);
  await supabase.from("profiles").update({ muted_topics: [...muted] }).eq("id", user.id);
  revalidatePath("/settings");
}

export async function unmuteArticle(articleId: string) {
  const { supabase, user } = await requireReader();
  await supabase.from("muted_articles").delete().eq("user_id", user.id).eq("article_id", articleId);
  revalidatePath("/settings");
}

export async function deleteAccount(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const { supabase, user } = await requireReader();
  if (formData.get("confirmation") !== "DELETE") {
    return { error: "Type DELETE exactly to confirm account deletion." };
  }

  try {
    const admin = createServiceClient();
    const pdfPaths: string[] = [];
    const pageSize = 100;
    let offset = 0;

    // Cached PDFs live outside Postgres cascades, so remove the reader's files first.
    while (true) {
      const { data, error } = await admin.storage
        .from("papers")
        .list(user.id, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
      if (error) {
        console.error("Account deletion could not list cached PDFs", error);
        return { error: "We could not prepare your account for deletion. Please try again." };
      }

      const files = (data ?? []).filter((item) => item.id !== null);
      pdfPaths.push(...files.map((item) => `${user.id}/${item.name}`));
      if (!data || data.length < pageSize) break;
      offset += pageSize;
    }

    for (let i = 0; i < pdfPaths.length; i += pageSize) {
      const { error } = await admin.storage.from("papers").remove(pdfPaths.slice(i, i + pageSize));
      if (error) {
        console.error("Account deletion could not remove cached PDFs", error);
        return { error: "We could not remove your saved editions. Please try again." };
      }
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("Supabase account deletion failed", error);
      return { error: "Your account could not be deleted. Please try again." };
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      // The user is already deleted; a stale browser session will be rejected on its next request.
      console.warn("Could not clear the deleted account's local session", error);
    }
  } catch (error) {
    console.error("Account deletion failed", error);
    return { error: "Your account could not be deleted. Please try again." };
  }

  redirect("/login?deleted=1");
}
