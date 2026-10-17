import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-stone-300 bg-[#f7f4ed] text-stone-700">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand & Editorial Mission */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-block font-serif text-2xl font-black tracking-tight text-stone-900">
              MARGINS
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold">
              The Personal Morning Paper
            </p>
            <p className="text-sm leading-relaxed text-stone-600 max-w-sm">
              A personal daily newspaper built from reporting across news outlets. Read focused briefings on the web or download a print-ready edition.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              Made for focused reading.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Publication</h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              <li>
                <a href="#how-it-works" className="hover:text-stone-950 hover:underline">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#problem-solution" className="hover:text-stone-950 hover:underline">
                  The Philosophy
                </a>
              </li>
              <li>
                <a href="#edition-preview" className="hover:text-stone-950 hover:underline">
                  Today&apos;s Edition
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-stone-950 hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#personalization" className="hover:text-stone-950 hover:underline">
                  Adaptive Learning
                </a>
              </li>
            </ul>
          </div>

          {/* Product Routes */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Reader Access</h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              <li>
                <Link href="/signup" className="hover:text-stone-950 hover:underline">
                  Get Your Paper
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-stone-950 hover:underline">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/paper" className="hover:text-stone-950 hover:underline">
                  Daily Paper View
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-stone-950 hover:underline">
                  Past Editions Archive
                </Link>
              </li>
              <li>
                <Link href="/learned" className="hover:text-stone-950 hover:underline">
                  What We&apos;ve Learned
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Standards & Accuracy Note */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Sources & summaries</h4>
            <p className="text-xs leading-relaxed text-stone-600">
              AI briefings are based on article headlines and snippets and may omit nuance. Each story links to its source reporting so you can read the full account.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-700">
                Source links accompany each briefing
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-stone-300 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Margins · Personal Morning Paper. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
