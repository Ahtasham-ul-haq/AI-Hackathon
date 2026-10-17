"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveSavedButton({ storyId, returnTo }: { storyId: string; returnTo?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/saved-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, saved: false }),
      });
      if (!response.ok) throw new Error("Could not remove this story from your saved list.");

      if (returnTo) {
        router.replace(returnTo);
      } else {
        window.location.reload();
      }
    } catch {
      setError("Could not remove this story. Please try again.");
      setBusy(false);
    }
  }

  return <div>
    <button type="button" disabled={busy} onClick={remove} className="mt-2 text-xs text-stone-600 underline underline-offset-2 hover:text-rose-800 disabled:cursor-wait disabled:opacity-60">
      {busy ? "Removing…" : "Remove from saved"}
    </button>
    {error && <p role="alert" className="mt-1 text-xs text-rose-800">{error}</p>}
  </div>;
}
