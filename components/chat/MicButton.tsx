"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Browser speech-to-text (Web Speech API, no package). Hidden where the browser doesn't support it.

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const subscribe = () => () => {};

/** Mic button: talk, and the words land in the message box. `base` is the text already typed. */
export function MicButton({ onText, base }: { onText: (text: string) => void; base: string }) {
  const supported = useSyncExternalStore(subscribe, () => getCtor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const start = useRef("");

  useEffect(() => () => rec.current?.abort(), []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    start.current = base ? `${base.trimEnd()} ` : "";
    r.onresult = (e) => {
      let said = "";
      for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
      onText((start.current + said).toLowerCase());
    };
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      console.warn("[mic]", e.error);
      setListening(false);
    };
    rec.current = r;
    setListening(true);
    r.start();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "stop listening" : "talk instead of typing"}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${
        listening ? "bg-red text-white" : "bg-[#e6dfd3] text-ink hover:bg-[#ddd4c6]"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="3.5" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
      </svg>
      {listening && <span className="sr-only">listening…</span>}
    </button>
  );
}
