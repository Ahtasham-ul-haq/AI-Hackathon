import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";

const principles = [
  {
    number: "01",
    title: "Know why a story is here",
    description: "See the interests that matched, how many outlets covered it, how fresh the reporting is, and whether it was selected as a discovery.",
  },
  {
    number: "02",
    title: "Make the paper yours",
    description: "Tune discovery, mute topics or individual stories, restore them whenever you like, and review or edit what Margins has learned.",
  },
  {
    number: "03",
    title: "Read on your terms",
    description: "Listen to an edition, save stories for later across devices, read the web edition, or download a print-ready PDF.",
  },
  {
    number: "04",
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
      <header className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">The Margins standard</span>
        <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-stone-950 sm:text-6xl">A premium reading experience. Free for everyone.</h1>
        <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">Carefully edited news, clear sources, reader-controlled personalization, and thoughtful ways to read—available to every Margins reader.</p>
      </header>

      <section aria-label="Reader features" className="mt-12 grid gap-4 sm:grid-cols-2">
        {principles.map((item) => <article key={item.number} className="rounded border border-stone-300 bg-white p-6 shadow-sm">
          <span className="font-mono text-xs font-bold text-stone-400">{item.number}</span>
          <h2 className="mt-2 font-serif text-xl font-bold text-stone-900">{item.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
        </article>)}
      </section>

      <section className="mt-10 rounded border border-stone-300 bg-[#f4f0e6] p-6 text-center sm:p-8">
        <h2 className="font-serif text-2xl font-bold text-stone-950">One complete product, for every reader.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">There are no paid plans or feature gates. Every reader can use the same personalization, archive, email, listening, saving, and PDF features.</p>
        {!user && <Link href="/signup" className="mt-5 inline-flex rounded bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700">Create your free paper</Link>}
      </section>
    </main>
  </>;
}
