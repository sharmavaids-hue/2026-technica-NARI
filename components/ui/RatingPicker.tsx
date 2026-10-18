"use client";

import { useId } from "react";
import type { Rating } from "@/lib/types";
import { BAR_COLORS } from "./Bars";

type RatingKind = "energy" | "discomfort" | "mood";

const HINTS: Record<RatingKind, string> = {
  energy: "1 = drained, 5 = full of energy",
  discomfort: "1 = none, 5 = a lot",
  mood: "1 = low, 5 = great",
};

type RatingPickerProps = {
  kind: RatingKind;
  value: Rating | null;
  onChange: (v: Rating | null) => void;
};

/** 1–5 picker built from real radio buttons, so arrow keys and screen readers just work. */
export function RatingPicker({ kind, value, onChange }: RatingPickerProps) {
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="flex w-full items-baseline justify-between gap-3">
        <span className="font-bold">{kind}</span>
        <span id={`${id}-hint`} className="text-sm text-muted">
          {HINTS[kind]}
        </span>
      </legend>
      <div className="flex gap-2" aria-describedby={`${id}-hint`}>
        {([1, 2, 3, 4, 5] as Rating[]).map((n) => {
          const checked = value === n;
          return (
            <label key={n} className="relative">
              <input
                type="radio"
                name={`${id}-${kind}`}
                value={n}
                checked={checked}
                onChange={() => onChange(n)}
                className="peer absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className={`flex size-11 items-center justify-center rounded-full border-[1.5px] font-bold tabular-nums transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
                  checked ? `${BAR_COLORS[kind]} border-transparent text-white` : "border-line bg-card text-ink"
                }`}
              >
                {n}
              </span>
              <span className="sr-only">{n}</span>
            </label>
          );
        })}
        {value !== null && (
          <button type="button" onClick={() => onChange(null)} className="ml-1 min-h-11 px-2 text-sm text-muted underline underline-offset-4">
            clear
          </button>
        )}
      </div>
    </fieldset>
  );
}
