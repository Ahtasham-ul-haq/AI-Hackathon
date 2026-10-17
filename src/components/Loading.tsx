"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px] ${className}`}
    />
  );
}

/** Cycles through progress messages while something slow runs; announced to screen readers. */
export function useRotatingMessage(messages: string[], active: boolean, everyMs = 3500) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((n) => Math.min(n + 1, messages.length - 1)), everyMs);
    return () => {
      clearInterval(t);
      setI(0);
    };
  }, [active, messages.length, everyMs]);
  return messages[i];
}

export function RotatingMessage({ messages, everyMs }: { messages: string[]; everyMs?: number }) {
  const msg = useRotatingMessage(messages, true, everyMs);
  return (
    <span role="status" aria-live="polite">
      {msg}
    </span>
  );
}

/** Full-area loading state used by route loading.tsx files. */
export function PageLoading({ title, messages }: { title: string; messages: string[] }) {
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-24 text-center" aria-busy="true">
      <Spinner className="h-8 w-8 text-stone-700" />
      <h1 className="mt-5 font-serif text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-stone-600">
        <RotatingMessage messages={messages} />
      </p>
    </div>
  );
}

/** Submit button for server-action forms: disables itself and shows a pending label. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} aria-busy={pending} className={`disabled:cursor-wait disabled:opacity-60 ${className ?? ""}`}>
      {pending ? (
        <>
          <Spinner className="mr-1.5 h-3 w-3" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
