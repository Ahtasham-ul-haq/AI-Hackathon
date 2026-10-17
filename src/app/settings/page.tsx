import { requireReader } from "@/lib/auth";
import { TOPIC_BY_SLUG } from "@/lib/topics";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicsForm } from "./TopicsForm";
import { PreferencesForm } from "./PreferencesForm";

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireReader();
  const { data: weights } = await supabase
    .from("interest_weights")
    .select("topic, subtopic")
    .eq("user_id", user.id);
  const topics = [...new Set((weights ?? []).map((w) => w.topic))].filter((t) => TOPIC_BY_SLUG[t]);
  const subtopics = (weights ?? []).filter((w) => w.subtopic).map((w) => `${w.topic}::${w.subtopic}`);

  return (
    <>
      <SiteHeader email={profile.email} />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Topics</h2>
          <p className="mb-4 text-sm text-stone-600">
            Today&apos;s paper stays as it is; changes apply from tomorrow morning.
          </p>
          <TopicsForm topics={topics} subtopics={subtopics} />
        </section>
        <section className="mt-12 border-t border-stone-300 pt-8">
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <PreferencesForm prefs={profile} />
        </section>
      </main>
    </>
  );
}
