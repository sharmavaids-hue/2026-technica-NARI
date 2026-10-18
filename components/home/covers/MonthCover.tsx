"use client";

import { useSyncExternalStore } from "react";
import { BubblesCover } from "./BubblesCover";
import { ColorCover } from "./ColorCover";
import { SwimCover } from "./SwimCover";

// one calm note per month, in nari's voice
const QUOTES = [
  "start where you are.",
  "be soft with yourself.",
  "rest is productive too.",
  "you deserve to be believed.",
  "slow days count.",
  "drink water, then decide.",
  "you're allowed to take up space.",
  "listen in, not out.",
  "small steps are still steps.",
  "your body is not a problem to solve.",
  "be gentle with yourself today.",
  "warm socks, kind thoughts.",
];

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

/** Which mini-game a month gets: month % 3 (october → swim, november → bubbles, december → coloring). */
export function coverKind(month: string): "swim" | "bubbles" | "color" {
  const m = Number(month.slice(5));
  return (["color", "swim", "bubbles"] as const)[m % 3];
}

/** A hand-made planner cover above the month grid. Decorative except for its mini-game. */
export function MonthCover({ month }: { month: string }) {
  const [y, m] = month.split("-").map(Number);
  const name = monthFmt.format(new Date(Date.UTC(y, m - 1, 1))).toLowerCase();
  const kind = coverKind(month);

  return (
    <div data-kind={kind} className="cover-turn relative mb-4 overflow-hidden rounded-[22px] border border-line">
      <div className={`relative sm:h-[210px] ${kind === "color" ? "h-[214px]" : "h-[150px]"}`}>
        {kind === "bubbles" ? <BubblesCover month={month} /> : kind === "color" ? <ColorCover month={month} /> : <SwimCover month={month} />}

        {/* paper label: handwritten month + typewriter date, like a journal page */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-3 rotate-[-2deg] rounded-[6px] bg-card/90 px-3 pb-1.5 pt-0.5 shadow-[0_2px_0_rgb(31_35_64/0.06)] sm:bottom-4 sm:left-5">
          <span className="block font-hand text-[2.1rem] leading-none text-ink sm:text-[3.4rem]">{name}</span>
          <span className="mt-0.5 block border-b-[1.5px] border-ink pb-0.5 text-right font-type text-[0.7rem] tracking-[0.12em] text-ink sm:text-[0.8rem]">
            {y}.{String(m).padStart(2, "0")}
          </span>
        </div>

        {/* the month's note */}
        <p aria-hidden="true" className={`pointer-events-none absolute right-3 top-2.5 max-w-[11rem] ${kind === "color" ? "hidden sm:block" : ""} text-right font-type text-[0.72rem] leading-snug text-ink/75 sm:right-5 sm:top-4 sm:max-w-[14rem] sm:text-[0.8rem]`}>
          {QUOTES[m - 1]}
        </p>
      </div>
    </div>
  );
}

// ---------- "hide cover", remembered on this device ----------
const KEY = "nari.coverHidden";
const listeners = new Set<() => void>();

function readHidden() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setCoverHidden(hidden: boolean) {
  try {
    window.localStorage.setItem(KEY, hidden ? "1" : "0");
  } catch {
    // private mode or storage blocked: the toggle still works for this visit
    memo = hidden;
  }
  listeners.forEach((l) => l());
}
let memo: boolean | null = null;

export function useCoverHidden() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => memo ?? readHidden(),
    () => false,
  );
}
