import { requireReader } from "@/lib/auth";
import { TOPIC_BY_SLUG } from "@/lib/topics";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicsForm } from "./TopicsForm";
import { PreferencesForm } from "./PreferencesForm";
import { toggleMutedTopic, unmuteArticle } from "./actions";
import { TOPICS } from "@/lib/topics";

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireReader();
  const { data: weights } = await supabase
    .from("interest_weights")
    .select("topic, subtopic")
    .eq("user_id", user.id);
  const topics = [...new Set((weights ?? []).map((w) => w.topic))].filter((t) => TOPIC_BY_SLUG[t]);
  const subtopics = (weights ?? []).filter((w) => w.subtopic).map((w) => `${w.topic}::${w.subtopic}`);
  const { data: mutedArticleRows } = await supabase.from("muted_articles").select("article_id, articles!inner(title, source_name)").eq("user_id", user.id).order("created_at", { ascending: false });
  const mutedArticles = (mutedArticleRows ?? []) as unknown as { article_id: string; articles: { title: string; source_name: string } | null }[];

  return (
    <>
      <SiteHeader email={profile.email} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        {/* Editorial Section Header */}
        <div className="border-b-2 border-stone-900 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
            Reader Configuration
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black text-stone-950 sm:text-5xl">
            Settings
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
            Customize which beats Margins tracks and adjust issue length, regional scope, and source filters.
          </p>
        </div>

        {/* Section 1: Topics */}
        <section className="mt-10 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-serif text-xl font-bold text-stone-900">Coverage Beats</h2>
            <p className="mt-1 text-xs text-stone-500">
              Changes take effect with your next morning run. Today&apos;s published edition is preserved.
            </p>
          </div>
          <div className="mt-6">
            <TopicsForm topics={topics} subtopics={subtopics} />
          </div>
        </section>

        {/* Section 2: Preferences */}
        <section className="mt-10 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-serif text-xl font-bold text-stone-900">Edition Delivery & Sources</h2>
            <p className="mt-1 text-xs text-stone-500">
              Control edition size, preferred news wires, and blocked publications.
            </p>
          </div>
          <div className="mt-6">
            <PreferencesForm prefs={profile} />
          </div>
        </section>
        <section className="mt-10 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-serif text-xl font-bold text-stone-900">Muted topics</h2>
            <p className="mt-1 text-xs text-stone-500">Muted topics are excluded from future editions. You can restore them at any time.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.filter((topic) => topics.includes(topic.slug)).map((topic) => {
              const muted = profile.muted_topics?.includes(topic.slug) ?? false;
              return <form key={topic.slug} action={toggleMutedTopic.bind(null, topic.slug)}>
                <button className={`rounded-full border px-3 py-1.5 text-xs ${muted ? "border-rose-300 bg-rose-50 text-rose-800" : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"}`}>
                  {muted ? `Unmute ${topic.name}` : `Mute ${topic.name}`}
                </button>
              </form>;
            })}
          </div>
        </section>
        <section className="mt-10 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-serif text-xl font-bold text-stone-900">Muted stories</h2>
            <p className="mt-1 text-xs text-stone-500">Muted articles are excluded from future editions. Restore one here if you change your mind.</p>
          </div>
          <ul className="mt-3 divide-y divide-stone-200">
            {mutedArticles.map((row) => <li key={row.article_id} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-stone-700"><strong>{row.articles?.source_name ?? "News outlet"}:</strong> {row.articles?.title ?? "Muted article"}</span>
              <form action={unmuteArticle.bind(null, row.article_id)}><button className="shrink-0 text-xs text-stone-600 underline hover:text-stone-950">Restore</button></form>
            </li>)}
            {!mutedArticles.length && <li className="py-4 text-sm text-stone-500">You have not muted any stories.</li>}
          </ul>
        </section>
      </main>
    </>
  );
}
