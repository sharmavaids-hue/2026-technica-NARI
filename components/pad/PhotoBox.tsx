"use client";

import { useId, useState } from "react";
import { CameraIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/Button";

type PhotoBoxProps = {
  /** object URL of the chosen photo, or null */
  url: string | null;
  onPick: (file: File) => void;
  onClear: () => void;
  status: "idle" | "looking" | "guessed" | "no-guess";
};

/** Optional pad photo: blurred until she chooses to look. Never stored. */
export function PhotoBox({ url, onPick, onClear, status }: PhotoBoxProps) {
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
        <p role="status" className="mr-auto text-[0.95rem]">
          {status === "looking" && "nari is taking a look…"}
          {status === "guessed" && "nari made a guess. change it if it's off."}
          {status === "no-guess" && "nari couldn't tell this time. pick what looks right."}
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
