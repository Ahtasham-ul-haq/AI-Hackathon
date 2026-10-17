"use client";

import { useEffect, useState } from "react";

export function ListenButton({ text, language }: { text: string; language: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function start() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  }
  return <div className="flex items-center gap-2 print:hidden">
    {!speaking ? <button type="button" onClick={start} className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-900">▶ Listen to edition</button> : <>
      <button type="button" onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); }} className="rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-700">Stop</button>
      <button type="button" onClick={() => { if (paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause(); setPaused(!paused); }} className="rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-700">{paused ? "Resume" : "Pause"}</button>
    </>}
  </div>;
}
