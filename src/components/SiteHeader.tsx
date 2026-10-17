"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";

export function SiteHeader({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = email ? [
    { href: "/paper", label: "Today" },
    { href: "/history", label: "Editions" },
    { href: "/saved", label: "Saved" },
    { href: "/premium", label: "The standard" },
    { href: "/learned", label: "Interests" },
    { href: "/settings", label: "Settings" },
  ] : [];

  function isActive(href: string) {
    return href === "/paper"
      ? pathname === href || pathname.startsWith(`${href}/`)
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-300 bg-[#faf8f3]/95 backdrop-blur-md print:hidden">
      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href={email ? "/paper" : "/"} className="group flex shrink-0 items-baseline gap-2.5 whitespace-nowrap">
          <span className="font-serif text-[1.7rem] font-black tracking-[-0.045em] text-stone-900 group-hover:text-stone-700">
            MARGINS
          </span>
          <span className="hidden whitespace-nowrap border-l border-stone-300 pl-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500 sm:inline-block">
            Morning paper
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-4 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-600 xl:flex 2xl:gap-6 2xl:text-[11px]">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 py-2 transition-colors ${
                  active
                    ? "border-stone-900 text-stone-950"
                    : "border-transparent hover:border-stone-400 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {email ? <form action={signOut} className="ml-1 border-l border-stone-300 pl-4">
            <button
              type="submit"
              className="rounded border border-stone-300 px-3 py-2 text-[11px] font-semibold text-stone-600 transition hover:border-stone-500 hover:bg-white hover:text-stone-900"
              title={email ?? undefined}
            >
              Sign out
            </button>
          </form> : <div className="ml-2 flex items-center gap-4 border-l border-stone-300 pl-4">
            <Link href="/login" className="text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-700 hover:text-stone-950">Sign in</Link>
            <Link href="/signup" className="rounded-sm bg-stone-900 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-stone-700">Create your paper</Link>
          </div>}
        </nav>

        {/* Mobile menu button */}
        <div className={`flex items-center gap-2 xl:hidden ${email ? "" : "hidden"}`}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            className="rounded-md border border-stone-300 p-2 text-stone-700 transition hover:bg-white hover:text-stone-950"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
        {!email && <div className="flex items-center gap-3 xl:hidden">
          <Link href="/login" className="text-xs font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950">Sign in</Link>
          <Link href="/signup" className="rounded-sm bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700">Create paper</Link>
        </div>}
      </div>

      {/* Mobile Drawer */}
      {email && menuOpen && (
        <div id="site-mobile-menu" className="border-t border-stone-200 bg-[#faf8f3] px-4 py-4 shadow-md xl:hidden sm:px-6">
          <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-stone-700">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded px-3 py-2.5 ${active ? "bg-stone-200/70 text-stone-950" : "hover:bg-stone-100 hover:text-stone-900"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-stone-200 pt-3">
              {email && <span className="max-w-[70%] truncate text-[11px] text-stone-500">{email}</span>}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded border border-stone-300 bg-white px-3 py-2 text-xs text-stone-600 hover:bg-stone-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
