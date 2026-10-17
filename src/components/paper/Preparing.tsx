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
    <div className="mx-auto w-full max-w-xl px-6 py-24 text-center" aria-busy="true">
      <AutoRefresh />
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-stone-900" />
      <h1 className="mt-6 font-serif text-3xl font-bold">Your paper is being prepared</h1>
      <p className="mt-3 text-lg text-stone-800">
        <RotatingMessage
          everyMs={6000}
          messages={[
            "Finding today's stories from 20+ outlets…",
            "Picking the stories that matter to you…",
            "Grouping reports of the same event…",
            "Writing your briefings…",
            "Laying out your paper…",
            "Nearly there, adding the final touches…",
          ]}
        />
      </p>
      <p className="mt-2 text-sm text-stone-500">
        This usually takes under a minute. Your paper will open here automatically.
      </p>
      {failed && (
        <p className="mt-4 text-sm text-amber-800">The last attempt hit a problem; retrying automatically.</p>
      )}
    </div>
  );
}
