"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RotatingMessage } from "@/components/Loading";

/** Re-renders the page every few seconds until the paper exists. */
export function AutoRefresh({ everyMs = 4000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(t);
  }, [router, everyMs]);
  return null;
}

export function Preparing({ failed }: { failed?: string | null }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 sm:px-6 sm:py-28 text-center animate-fade-in" aria-busy="true">
      <AutoRefresh />

      {/* Editorial press icon / animated spinner */}
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-stone-900 border-t-transparent" />
        <span className="font-serif text-lg font-bold text-stone-900">D</span>
      </div>

      <div className="mt-8 border-y border-stone-300 py-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          The Printing Press is Running
        </span>
        <h1 className="mt-2 font-serif text-3xl font-black text-stone-950 sm:text-4xl">
          Your morning paper is being prepared
        </h1>
        <div className="mt-3 font-serif text-lg text-stone-800">
          <RotatingMessage
            everyMs={5000}
            messages={[
              "Scanning today's dispatches from 20+ outlets…",
              "Selecting stories tailored to your interests…",
              "Synthesizing multiple reports of identical events…",
              "Writing concise, grounded AI briefings…",
              "Typesetting your front page and sections…",
              "Finalizing editorial layout for screen and PDF…",
            ]}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-500">
        This initial edition usually compiles in under 45 seconds. The page updates automatically when ready.
      </p>

      {failed && (
        <div className="mt-6 border-l-2 border-amber-600 bg-amber-50 p-3 text-xs text-amber-900">
          Notice: The previous generation encountered a transient provider timeout. Margins is automatically retrying with our backup model.
        </div>
      )}
    </div>
  );
}
