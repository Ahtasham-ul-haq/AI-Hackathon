import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/LandingNav";
import { InteractiveNewspaper } from "@/components/landing/InteractiveNewspaper";
import { PersonalizationDemo } from "@/components/landing/PersonalizationDemo";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default async function Home() {
  // Check if a user session is active (to render appropriate navigation state)
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      userEmail = user.email;
    }
  } catch {
    // If Supabase is unconfigured in development/testing, fail gracefully
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* 1. Header / Navigation */}
      <LandingNav email={userEmail} />

      {/* 2. Hero Section: Masthead + Immediate Editorial Value Proposition */}
      <section className="relative overflow-hidden border-b border-stone-300 pt-8 pb-16 sm:pt-14 sm:pb-24">
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Hackathon badge & kicker */}
            <div className="inline-flex items-center gap-2 border-y border-stone-400 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-600">
              <span>One thoughtful edition, every morning</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="mt-6 font-serif text-4xl font-black tracking-tight text-stone-950 sm:text-6xl md:text-7xl">
              The news, edited for you.
            </h1>

            {/* Supporting Copy */}
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-700 sm:text-xl font-serif">
              Your interests. The world&apos;s stories. One personal newspaper, ready every morning.
            </p>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              A personal daily edition built from reporting across news outlets, with concise briefings, clear source links, and a print-ready PDF.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-sm bg-stone-900 px-7 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                Get your paper
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-sm border border-stone-400 bg-transparent px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white hover:text-stone-950"
              >
                See how it works ↓
              </a>
              <Link
                href="/login"
                className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 underline sm:hidden"
              >
                Existing reader? Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-stone-200 pt-5 text-xs text-stone-600">
              <span>Source links with every briefing</span>
              <span aria-hidden="true" className="hidden text-stone-400 sm:inline">·</span>
              <span>Personalized to your interests</span>
              <span aria-hidden="true" className="hidden text-stone-400 sm:inline">·</span>
              <span>Free for every reader</span>
            </div>
          </div>

          {/* Newspaper Visual Preview in Hero */}
          <div className="mt-12 sm:mt-16">
            <div className="mx-auto max-w-5xl rounded-xs shadow-2xl ring-1 ring-stone-900/10">
              <div className="border-b border-stone-300 bg-stone-200/60 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                An edition, at a glance
              </div>
              <InteractiveNewspaper />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 3: The Problem vs The Solution */}
      <section id="problem-solution" className="border-b border-stone-300 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
              The noise of everywhere versus the focus of one.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Modern news consumption is designed for friction, ad impressions, and endless scrolling.
              Margins was engineered with an opposite thesis: a finite daily publication that respects your attention.
            </p>
          </div>

          {/* Contrast Comparison Grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* The Problem */}
            <div className="rounded-xs border border-stone-300 bg-[#f4f0e6] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-300 pb-3">
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-rose-800">
                    The Modern Burden
                  </span>
                  <span className="font-mono text-xs text-stone-500">Endless Fragmented Web</span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900">
                  The news is everywhere.
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  Important coverage is scattered across apps, newsletters, and feeds that compete for your attention.
                </p>

                <ul className="mt-6 space-y-3.5 text-sm text-stone-700">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span>Duplicate alerts and repeat coverage make it difficult to follow one developing story.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span><strong>Endless timeline feeds</strong> optimized to prolong session duration rather than inform.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span><strong>Sensationalized headlines</strong> burying key context under speculative analysis.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span>Long reading sessions can make it harder to remember what actually mattered.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-stone-300 pt-4 text-xs italic text-stone-500 font-serif">
                &ldquo;You didn&apos;t get informed; you just exhausted your morning bandwidth.&rdquo;
              </div>
            </div>

            {/* The Solution */}
            <div className="rounded-xs border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-900 pb-3">
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900">
                    The Margins Standard
                  </span>
                  <span className="rounded bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Grounded Architecture
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold text-stone-950">
                  One paper. Your priorities.
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  A finite, beautifully edited edition arriving each morning, structured into clear editorial sections.
                </p>

                <ul className="mt-6 space-y-3.5 text-sm text-stone-800">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span><strong>Personalized curation:</strong> 15–20 stories curated across topics you care about, plus 1-in-5 related discoveries.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span><strong>Concise, source-grounded briefings:</strong> AI summaries are generated from article headlines and snippets, with original coverage linked for context.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span><strong>Transparent source attribution:</strong> Every briefing displays its source outlets, publication dates, and differing details.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span><strong>Print-ready PDF edition:</strong> A classic dual-column layout cached and ready for offline reading on any device.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-stone-200 pt-4 text-xs font-serif italic text-stone-700">
                &ldquo;Read what matters, close the paper, and move on with your day.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 4: How It Works */}
      <section id="how-it-works" className="border-b border-stone-300 bg-[#f7f5ed] py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
              How Margins works in three steps.
            </h2>
            <p className="mt-4 text-base text-stone-600">
              Set your interests once, then refine the mix as you read.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col rounded-xs border border-stone-300 bg-white p-6 shadow-xs">
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
                <span className="font-serif text-3xl font-black text-stone-900">01</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Two-Minute Setup
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
                Tell us what matters
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Select from core subjects like World News, AI & Tech, Politics, Climate, Science, and Sports.
                Narrow any topic with specific subtopics, or type one plain sentence such as:
              </p>
              <div className="mt-4 rounded border border-stone-200 bg-stone-50 p-2.5 font-serif text-xs italic text-stone-700">
                &ldquo;I follow Pakistani cricket, renewable energy grids, and open-source AI startups.&rdquo;
              </div>
              <p className="mt-3 text-xs text-stone-500">
                Margins parses your sentence into concrete starting interest weights (baseline 3.0).
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col rounded-xs border border-stone-300 bg-white p-6 shadow-xs">
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
                <span className="font-serif text-3xl font-black text-stone-900">02</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Every Morning at Dawn
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
                Get your daily edition
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Scheduled hourly background routines check each reader&apos;s local timezone. When morning arrives,
                Margins scans fresh feeds from 20+ outlets:
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-800"></span>
                  <span>BBC, Guardian, Dawn, Reuters, Verge, TechCrunch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-800"></span>
                  <span>AI editor balances top stories with discovery topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-800"></span>
                  <span>Groups duplicate reports into one coherent briefing</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                Your first edition begins after you choose your interests.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col rounded-xs border border-stone-300 bg-white p-6 shadow-xs">
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
                <span className="font-serif text-3xl font-black text-stone-900">03</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Web & Print Reading
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
                Read, explore, and refine
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Read on the clean web reader or download the cached multi-column PDF edition for offline reading.
                Every interaction shapes tomorrow:
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">+1.0</span>
                  <span>Reading or tapping briefing expands details</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-700 font-bold">-1.0</span>
                  <span>Tapping Skip immediately refines future runs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-bold">PDF</span>
                  <span>Always retains full paper even when stories skipped on web</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                Audit every weight change live in the &ldquo;What We&apos;ve Learned&rdquo; dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 5: Editorial Product Features */}
      <section id="features" className="border-b border-stone-300 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
              A paper made for the way you read.
            </h2>
            <p className="mt-4 text-base text-stone-600">
              Designed around authentic newspaper mechanics rather than generic software templates.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-x-12 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Personalization</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                A paper that knows your interests
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Select broad disciplines or pinpoint narrow curiosities. Start with one simple sentence describing your focus, and Margins translates it into weighted topics.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Subtopic granularity across 12 primary beats
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Consolidated Curation</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                One place for the stories that matter
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Stop bouncing between twenty paywalled homepages and fragmented newsletters. Margins aggregates, deduplicates, and organizes today&apos;s developments into named editorial sections.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Groups multi-outlet reports into single storylines
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Print Tradition</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                Your newspaper, in print-ready form
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Experience the tactile rhythm of print journalism. Each edition compiles into a downloadable PDF featuring double-line mastheads, rules, two-column layout, and outlet-credited photos.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Instant PDF download cached in Supabase storage
              </div>
            </div>

            {/* Feature 4 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Edition Archive</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                Your reading history preserved
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Every edition is archived indefinitely. Browse recent papers or look up any historic date using the integrated date picker to review what was shaping the world on that day.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Full web & PDF access for every past issue
              </div>
            </div>

            {/* Feature 5 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Editorial Integrity</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                Less noise, more context
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                AI briefings are generated from source headlines and snippets, with outlet links beside each story. Summaries can omit nuance, so consult the original reporting for full context. When sources report conflicting details, the edition flags the disagreement.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Clear &ldquo;AI-written summary&rdquo; transparency label
              </div>
            </div>

            {/* Feature 6 */}
            <div className="border-t border-stone-300 py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Controlled Feedback</div>
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">
                Learning that improves your paper
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Your behavior naturally guides future papers. Opening articles deepens interest; skipping stories lowers frequency. Inspect and correct your interest profile anytime.
              </p>
              <div className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                Complete user control: adjust or reset weights live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 6: Dedicated Newspaper Preview Section */}
      <section id="edition-preview" className="border-b border-stone-300 bg-[#f4efe4] py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
              See your edition take shape
            </h2>
            <p className="mt-4 text-base text-stone-600">
              A closer look at the reading experience: concise briefings, clear source links, and room to focus.
            </p>
          </div>

          <div className="mt-12">
            <InteractiveNewspaper readerName="Jane Doe" editionDate="Saturday Morning Edition" />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xs bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-stone-800"
            >
              Create your first edition →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Section 7: Personalization & Learning Mechanics */}
      <section id="personalization" className="border-b border-stone-300 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
              Personalization you can see and control.
            </h2>
            <p className="mt-4 text-base text-stone-600">
              Unlike social media feeds that hide why you are shown content, Margins turns your reading actions into explicit weights that you can review and edit in real time.
            </p>
          </div>

          <div className="mt-12">
            <PersonalizationDemo />
          </div>
        </div>
      </section>

      <section id="premium" className="border-b border-stone-300 bg-[#f7f5ed] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">A more considered way to read the news.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">Source context, transparent personalization, email delivery, listening, saved stories, and a print-ready edition are part of the same free product for everyone.</p>
          <Link href="/premium" className="mt-7 inline-flex rounded bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700">Explore the Margins standard</Link>
        </div>
      </section>

      {/* 8. Section 8: Final CTA */}
      <section className="relative overflow-hidden bg-stone-900 py-20 text-white sm:py-28">
        <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold leading-tight tracking-[-0.025em] text-stone-50 sm:text-6xl">
            Make room for the news that matters.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-stone-300 sm:text-xl">
            Start your day with a clearer view of the stories shaping your world. No feeds. No endless scroll.
            One personal edition, ready when you are.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xs bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-stone-950 shadow-lg transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get your paper
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xs border border-stone-700 px-6 py-3.5 text-sm font-semibold text-stone-300 transition hover:border-stone-500 hover:text-white"
            >
              Sign in to your account
            </Link>
          </div>

          <p className="mt-6 text-xs text-stone-400">Free for every reader.</p>
        </div>
      </section>

      {/* 9. Section 9: Footer */}
      <LandingFooter />
    </div>
  );
}
