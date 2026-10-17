"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";

export function LandingNav({ email }: { email?: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/80 bg-[#faf8f3]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Editorial Brand / Masthead badge */}
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-serif text-2xl font-black tracking-tight text-stone-900 transition-colors group-hover:text-stone-700">
            MARGINS
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:inline-block">
            Personal Morning Paper
          </span>
        </Link>

        {/* Desktop Section anchor links */}
        <nav className="hidden items-center gap-7 text-xs font-medium uppercase tracking-wider text-stone-600 md:flex">
          <a
            href="#how-it-works"
            className="transition hover:text-stone-950 hover:underline underline-offset-4"
          >
            How It Works
          </a>
          <a
            href="#problem-solution"
            className="transition hover:text-stone-950 hover:underline underline-offset-4"
          >
            The Philosophy
          </a>
          <a
            href="#edition-preview"
            className="transition hover:text-stone-950 hover:underline underline-offset-4"
          >
            Today&apos;s Edition
          </a>
          <a
            href="#features"
            className="transition hover:text-stone-950 hover:underline underline-offset-4"
          >
            Features
          </a>
          <a
            href="#personalization"
            className="transition hover:text-stone-950 hover:underline underline-offset-4"
          >
            Adaptive Weights
          </a>
        </nav>

        {/* Actions / Auth & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {email ? (
            <div className="flex items-center gap-3">
              <Link
                href="/paper"
                className="hidden text-xs font-semibold uppercase tracking-wider text-stone-900 transition hover:underline sm:inline"
              >
                Today&apos;s Paper →
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded border border-stone-300 bg-white/80 px-2.5 py-1 text-xs text-stone-600 transition hover:border-stone-400 hover:bg-stone-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:text-stone-950 hover:underline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xs bg-stone-900 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-xs transition hover:bg-stone-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 active:scale-98"
              >
                Get your paper
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="ml-1 inline-flex items-center justify-center rounded p-1.5 text-stone-700 hover:bg-stone-200 md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-[#faf8f3] px-4 py-4 md:hidden animate-fade-in shadow-lg">
          <nav className="flex flex-col space-y-3 text-xs font-medium uppercase tracking-wider text-stone-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-950"
            >
              How It Works
            </a>
            <a
              href="#problem-solution"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-950"
            >
              The Philosophy
            </a>
            <a
              href="#edition-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-950"
            >
              Today&apos;s Edition
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-950"
            >
              Features
            </a>
            <a
              href="#personalization"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-950"
            >
              Adaptive Weights
            </a>
            {email && (
              <Link
                href="/paper"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 font-bold text-stone-900 border-t border-stone-200 pt-2"
              >
                Go to Today&apos;s Paper →
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
