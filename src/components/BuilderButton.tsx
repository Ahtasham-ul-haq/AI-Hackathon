"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner, useRotatingMessage } from "@/components/Loading";

/** Builder-only demo control (the server checks BUILDER_EMAIL too). */
export function BuilderButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | string>("idle");
  const step = useRotatingMessage(
    ["Fetching the latest news…", "Editing the next edition…", "Writing briefings…", "Saving the paper…"],
    state === "busy",
    6000,
  );
  async function run() {
    setState("busy");
    const res = await fetch("/api/builder/generate", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.status === "created") {
      setState("idle");
      router.refresh();
    } else {
      setState(body.error ?? body.reason ?? `Failed (${res.status})`);
    }
  }
  return (
    <div className="flex items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-950 print:hidden">
      <span className="font-semibold">Builder</span>
      <button onClick={run} disabled={state === "busy"} aria-busy={state === "busy"} className="rounded bg-amber-900 px-3 py-1 text-white disabled:opacity-50">
        {state === "busy" ? <><Spinner className="mr-1.5 h-3 w-3" />{step}</> : "Generate next edition now"}
      </button>
      {state !== "idle" && state !== "busy" && <span role="alert">{state}</span>}
    </div>
  );
}
