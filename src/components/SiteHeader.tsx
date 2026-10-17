"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";

export function SiteHeader({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/paper", label: "Today" },
    { href: "/history", label: "Past editions" },
    { href: "/saved", label: "Saved stories" },
    { href: "/premium", label: "The Margins standard" },
    { href: "/learned", label: "What we've learned" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-300/80 bg-[#faf8f3]/95 backdrop-blur-md print:hidden transition-all">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/paper" className="group flex items-baseline gap-2">
          <span className="font-serif text-xl font-black tracking-tight text-stone-900 group-hover:text-stone-700">
            MARGINS
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:inline-block">
            Morning Paper
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-wider text-stone-600 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/paper" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all py-1 border-b-2 ${
                  isActive
                    ? "border-stone-900 font-bold text-stone-950"
                    : "border-transparent hover:border-stone-400 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <form action={signOut} className="ml-2">
            <button
              type="submit"
              className="rounded border border-stone-300 px-2.5 py-1 text-xs text-stone-500 transition hover:border-stone-400 hover:bg-stone-100 hover:text-stone-800"
              title={email ?? undefined}
            >
              Sign out
            </button>
          </form>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="rounded p-1.5 text-stone-700 hover:bg-stone-200"
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
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-stone-200 bg-[#faf8f3] px-4 py-3 md:hidden animate-fade-in shadow-md">
          <nav className="flex flex-col space-y-2 text-xs font-medium uppercase tracking-wider text-stone-700">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-1.5 ${isActive ? "font-bold text-stone-950 underline underline-offset-4" : "hover:text-stone-900"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
              {email && <span className="text-[11px] text-stone-500 truncate max-w-[200px]">{email}</span>}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100"
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
