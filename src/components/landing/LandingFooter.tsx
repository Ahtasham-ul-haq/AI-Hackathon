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
              An AI-edited daily newspaper tailored to individual curiosity. Grounded exclusively in verified
              outlets, formatted for focused morning reading, and typeset into a print-ready edition.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              Built for the <strong className="text-stone-800">NaSCon &apos;26 AI Hackathon</strong>.
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Accuracy & Integrity</h4>
            <p className="text-xs leading-relaxed text-stone-600">
              Margins enforces strict verification rules: zero hallucinated quotes or unsupported assertions, visible AI attribution, dual-model failover redundancy, and direct links to primary reporting.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> 22 RSS wires & GNews cached
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-stone-300 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Margins · Personal Morning Paper. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Local edition generation via Next.js App Router</span>
            <span>·</span>
            <span>Postgres with Row-Level Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
