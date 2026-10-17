"use client";

import { useState } from "react";

export function RemoveSavedButton({ storyId }: { storyId: string }) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    await fetch("/api/saved-stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storyId, saved: false }) });
    window.location.reload();
  }
  return <button type="button" disabled={busy} onClick={remove} className="mt-2 text-xs text-stone-500 underline hover:text-rose-800">{busy ? "Removing…" : "Remove from saved"}</button>;
}
