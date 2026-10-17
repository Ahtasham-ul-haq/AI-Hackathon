import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialPageHeader } from "@/components/EditorialPageHeader";

const principles = [
  {
    title: "Know why a story is here",
    description: "See the interests that matched, how many outlets covered it, how fresh the reporting is, and whether it was selected as a discovery.",
  },
  {
    title: "Make the paper yours",
    description: "Tune discovery, mute topics or individual stories, restore them whenever you like, and review or edit what Margins has learned.",
  },
  {
    title: "Read on your terms",
    description: "Listen to an edition, save stories for later across devices, read the web edition, or download a print-ready PDF.",
  },
  {
    title: "Get your morning edition",
    description: "Opt into daily email delivery and choose the local hour it arrives. Email delivery is available when the service is configured.",
  },
];

export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <>
    <SiteHeader email={user?.email} />
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <EditorialPageHeader align="center" title="A more thoughtful way to read the news" description="Source context, transparent personalization, and useful ways to read come together in one daily edition—free for every reader." />
      </div>

      <section aria-label="Reader features" className="mt-10 border-y border-stone-300">
        {principles.map((item) => <article key={item.title} className="grid gap-2 border-b border-stone-200 py-5 last:border-0 sm:grid-cols-[minmax(11rem,0.7fr)_1.3fr] sm:gap-8 sm:py-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">{item.title}</h2>
          <p className="max-w-[68ch] text-sm leading-relaxed text-stone-600">{item.description}</p>
        </article>)}
      </section>

      <section className="mt-10 border-t-2 border-stone-900 bg-[#f4f0e6] p-6 text-center sm:p-8">
        <h2 className="font-serif text-2xl font-bold text-stone-950">One complete product, for every reader.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">There are no paid plans or feature gates. Every reader can use the same personalization, archive, email, listening, saving, and PDF features.</p>
        {!user && <Link href="/signup" className="mt-5 inline-flex rounded bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700">Create your free paper</Link>}
      </section>
    </main>
  </>;
}
