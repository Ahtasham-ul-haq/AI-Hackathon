"use client";

import { useState } from "react";
import { Spinner, useRotatingMessage } from "@/components/Loading";

const STEPS = ["Preparing your PDF…", "Laying out the columns…", "Adding the photos…", "Almost ready…"];

/** Downloads the paper's PDF with visible progress (the first render takes a few seconds). */
export function PdfButton({
  paperId,
  date,
  failedBefore,
  className = "font-semibold underline",
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

  return (
    <button onClick={download} disabled={state === "busy"} aria-busy={state === "busy"}
      className={`disabled:cursor-wait ${className}`}>
      <span role="status" aria-live="polite">
        {state === "busy" ? (
          <>
            <Spinner className="mr-1 h-3 w-3" />
            {step}
          </>
        ) : state === "failed" ? (
          "PDF is being prepared — try again"
        ) : (
          "Download PDF"
        )}
      </span>
    </button>
  );
}
