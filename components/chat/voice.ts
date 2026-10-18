"use client";

// Nari's voice: one audio at a time, fetched from our own /api/voice/speak (ElevenLabs on the server).
// On ANY failure the listen buttons hide for the rest of the session; captions always stay on screen.

import { useSyncExternalStore } from "react";

export const SPEAK_MAX = 600;
const OFF_KEY = "nari.voiceOff";

type State = { off: boolean; loadingId: string | null; playingId: string | null };
let state: State = { off: readOff(), loadingId: null, playingId: null };
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
let audioUrl: string | null = null;
let request: AbortController | null = null;

function readOff() {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function disable(why: unknown) {
  console.warn("[voice] turned off for this session:", why);
  try {
    window.sessionStorage.setItem(OFF_KEY, "1");
  } catch {
    // storage blocked: still off for this page
  }
  stop();
  set({ off: true });
}

/** Stop whatever is loading or playing. */
export function stop() {
  request?.abort();
  request = null;
  if (audio) {
    audio.pause();
    audio = null;
  }
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
  set({ loadingId: null, playingId: null });
}

/** Speak one message. Starting a new one stops the old one. */
export async function speak(id: string, text: string) {
  if (state.off) return;
  stop();
  const ctrl = new AbortController();
  request = ctrl;
  set({ loadingId: id });
  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim().slice(0, SPEAK_MAX) }),
      signal: ctrl.signal,
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("audio")) {
      const detail = type.includes("json") ? await res.json().catch(() => null) : null;
      disable(detail?.reason ?? `status ${res.status}`);
      return;
    }
    const blob = await res.blob();
    if (request !== ctrl) return; // replaced or stopped meanwhile
    audioUrl = URL.createObjectURL(blob);
    audio = new Audio(audioUrl);
    audio.onended = () => stop();
    audio.onerror = () => disable("audio could not play");
    await audio.play();
    set({ loadingId: null, playingId: id });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    disable(err);
  }
}

const SERVER_STATE: State = { off: false, loadingId: null, playingId: null };

export function useVoice() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => SERVER_STATE,
  );
}
