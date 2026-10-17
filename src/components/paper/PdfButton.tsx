"use client";

import { useState } from "react";
import { Spinner, useRotatingMessage } from "@/components/Loading";

const STEPS = ["Preparing your PDF…", "Laying out the columns…", "Adding the photos…", "Almost ready…"];

/** Downloads the paper's PDF with visible progress (the first render takes a few seconds). */
export function PdfButton({
  paperId,
  date,
  failedBefore,
  className,
}: {
  paperId: string;
  date: string;
  failedBefore?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "failed">(failedBefore ? "failed" : "idle");
  const step = useRotatingMessage(STEPS, state === "busy", 2500);

  async function download() {
    setState("busy");
    try {
      const res = await fetch(`/api/papers/${paperId}/pdf`);
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `morning-paper-${date}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch {
      setState("failed");
    }
  }

  const defaultClasses =
    "inline-flex items-center gap-1.5 rounded-xs border border-stone-800 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 shadow-2xs transition hover:bg-stone-900 hover:text-white cursor-pointer";

  return (
    <button
      onClick={download}
      disabled={state === "busy"}
      aria-busy={state === "busy"}
      className={`disabled:cursor-wait ${className ?? defaultClasses}`}
    >
      <span role="status" aria-live="polite" className="inline-flex items-center">
        {state === "busy" ? (
          <>
            <Spinner className="mr-1.5 h-3 w-3" />
            {step}
          </>
        ) : state === "failed" ? (
          "PDF is being prepared — try again"
        ) : (
          <>
            <svg
              className="h-3.5 w-3.5 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </>
        )}
      </span>
    </button>
  );
}
