import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Interest } from "@/lib/interests";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  timezone: string;
  onboarded: boolean;
  interests_note: string | null;
  baseline_interests: { picked: Interest[]; note: Interest[] } | null;
  region: string | null;
  language: string;
  preferred_sources: string[];
  avoided_sources: string[];
  length: "short" | "standard" | "long";
};

/** Current reader + profile, or redirect to /login. */
export async function requireReader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login");
  return { supabase, user, profile };
}

export function isBuilder(email: string | null | undefined) {
  const builder = process.env.BUILDER_EMAIL?.trim().toLowerCase();
  return !!builder && !!email && email.toLowerCase() === builder;
}
