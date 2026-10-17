"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="mx-auto w-full max-w-xl px-6 py-24 text-center">
      <AutoRefresh />
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-stone-900" />
      <h1 className="mt-6 font-serif text-3xl font-bold">Your paper is being prepared</h1>
      <p className="mt-2 text-stone-600">
        We&apos;re gathering this morning&apos;s stories and writing your briefings. This takes under a minute.
      </p>
      {failed && (
        <p className="mt-4 text-sm text-amber-800">The last attempt hit a problem; retrying automatically.</p>
      )}
    </div>
  );
}
