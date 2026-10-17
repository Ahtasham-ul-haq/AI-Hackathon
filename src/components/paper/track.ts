export type EventKind = "open" | "skip" | "scroll_past";

/** Fire-and-forget reading event; weights update on the server instantly. */
export function track(storyId: string, kind: EventKind) {
  const body = JSON.stringify({ storyId, kind });
  if (kind === "scroll_past" && typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
    () => {},
  );
}
