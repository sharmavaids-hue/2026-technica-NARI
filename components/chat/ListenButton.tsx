"use client";

import { speak, stop, useVoice } from "./voice";

/** Small speaker button under a Nari message. Hidden for the session if voice isn't available. */
export function ListenButton({ id, text }: { id: string; text: string }) {
  const v = useVoice();
  if (v.off || !text.trim()) return null;
  const loading = v.loadingId === id;
  const playing = v.playingId === id;

  return (
    <button
      type="button"
      onClick={() => (loading || playing ? stop() : speak(id, text))}
      aria-label={playing ? "stop reading this message" : loading ? "loading nari's voice, tap to cancel" : "listen to this message"}
      aria-pressed={playing}
      className="-ml-2 -mt-1 inline-flex min-h-11 items-center gap-1.5 self-start rounded-pill px-2 text-sm font-bold text-blue hover:bg-blue/5"
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
          <path d={loading ? "M15.5 12h.01M18.5 12h.01" : "M15.5 9.2a4 4 0 010 5.6M18.2 6.6a7.6 7.6 0 010 10.8"} className={loading ? "animate-pulse" : ""} />
        </svg>
      )}
      {playing ? "stop" : loading ? "loading…" : "listen"}
    </button>
  );
}
