"use client";

import { useId, useState } from "react";
import type { PadFailReason } from "@/lib/types";
import { CameraIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/Button";

export type PhotoStatus = "idle" | "looking" | "guessed" | "no-guess" | "bad-format";

const MESSAGES: Record<PhotoStatus, string> = {
  idle: "",
  looking: "nari's looking…",
  guessed: "nari made a guess below. change it if it's off.",
  "no-guess": "i couldn't read that photo. pick it yourself below.",
  "bad-format": "that photo didn't open here. try a jpg or png, or pick it yourself below.",
};

/** Why the server had no guess, in plain words. Every one ends with what to do next. */
const FAIL_MESSAGES: Record<PadFailReason, string> = {
  busy: "nari's AI is busy right now. pick it yourself below.",
  timeout: "nari's AI is busy right now. pick it yourself below.",
  "not-a-pad": "nari couldn't spot a pad in that photo. pick it yourself below.",
  blocked: "nari couldn't read that photo. pick it yourself below.",
  "bad-photo": "that photo didn't come through. try another one, or pick it yourself below.",
  "no-key": "photo guesses aren't switched on right now. pick it yourself below.",
  error: "nari couldn't read that photo. pick it yourself below.",
};

type PhotoBoxProps = {
  /** object URL of the chosen photo, or null */
  url: string | null;
  onPick: (file: File) => void;
  onClear: () => void;
  status: PhotoStatus;
  /** set with status "no-guess" when the server said why */
  reason?: PadFailReason | null;
};

/** Optional pad photo: blurred until she chooses to look. Never stored. */
export function PhotoBox({ url, onPick, onClear, status, reason }: PhotoBoxProps) {
  const id = useId();
  // remembers which photo was revealed, so a new photo always starts blurred again
  const [revealedUrl, setRevealedUrl] = useState<string | null>(null);
  const revealed = url !== null && revealedUrl === url;
  const setRevealed = (on: boolean) => setRevealedUrl(on ? url : null);

  const picker = (
    <input
      id={id}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onPick(f);
        e.target.value = "";
      }}
    />
  );

  if (!url) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-inner border-[1.5px] border-dashed border-line bg-paper/60 px-5 py-8 text-center">
        {picker}
        <label htmlFor={id} className={buttonClass("solid-blue", "md")}>
          <CameraIcon size={18} />
          snap or upload a photo
        </label>
        <p className="max-w-sm text-[0.95rem] text-muted">
          optional. nari takes a quick look to suggest a soak level, then forgets it. photos are never saved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-52 overflow-hidden rounded-inner bg-[#e6dccc] sm:h-56">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded as an <img> */}
        <img
          src={url}
          alt={revealed ? "your pad photo" : "your pad photo, blurred"}
          className={`size-full object-cover transition-[filter,transform] duration-300 ${revealed ? "" : "scale-110 blur-2xl"}`}
        />
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              aria-pressed={false}
              onClick={() => setRevealed(true)}
              className={buttonClass("solid-blue", "md", "bg-ink hover:bg-ink/90")}
            >
              tap to reveal photo
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p role="status" aria-busy={status === "looking"} className={`mr-auto flex items-center gap-2 text-[0.95rem] ${status === "guessed" ? "font-bold text-blue" : ""}`}>
          {status === "looking" && (
            <span aria-hidden="true" className="inline-flex gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 rounded-full bg-blue" style={{ animation: "typing 1.2s infinite", animationDelay: `${d * 0.15}s` }} />
              ))}
            </span>
          )}
          {status === "no-guess" && reason ? FAIL_MESSAGES[reason] : MESSAGES[status]}
        </p>
        {revealed && (
          <button type="button" onClick={() => setRevealed(false)} className="min-h-11 font-bold text-blue underline underline-offset-4">
            blur it again
          </button>
        )}
        {picker}
        <label htmlFor={id} className="inline-flex min-h-11 items-center font-bold text-blue underline underline-offset-4">
          retake
        </label>
        <button type="button" onClick={onClear} className="min-h-11 font-bold text-blue underline underline-offset-4">
          remove photo
        </button>
      </div>
    </div>
  );
}
