"use client";

import { useState } from "react";
import { CLOT_POINTS, HEAVY_THRESHOLD, LEAK_POINTS, SOAK_POINTS } from "@/lib/pbac";
import type { Score } from "@/lib/types";
import { Dialog } from "./Dialog";
import { ClotIcon, PadIcon } from "./PadIcon";
import { scoreProgress } from "./scoreProgress";

const LEGEND = [
  { icon: <PadIcon soak="light" size={22} />, label: "light pad", pts: SOAK_POINTS.light },
  { icon: <PadIcon soak="moderate" size={22} />, label: "moderate pad", pts: SOAK_POINTS.moderate },
  { icon: <PadIcon soak="full" size={22} />, label: "full pad", pts: SOAK_POINTS.full },
  { icon: <ClotIcon clot="small" size={26} />, label: "small clot", pts: CLOT_POINTS.small },
  { icon: <ClotIcon clot="large" size={26} />, label: "large clot", pts: CLOT_POINTS.large },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M13 4c3.5 5 6 8 6 11a6 6 0 01-12 0c0-3 2.5-6 6-11z" fill="#b83e4b" />
      </svg>
    ),
    label: "leak or flooding",
    pts: LEAK_POINTS,
  },
];

/** "what's this?" button + dialog explaining the PBAC period score. */
export function ScoreExplainer({ score, className = "" }: { score: Score; className?: string }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(100, (score.value / (HEAVY_THRESHOLD * 1.25)) * 100);
  const line = (HEAVY_THRESHOLD / (HEAVY_THRESHOLD * 1.25)) * 100;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={`no-print inline-flex min-h-11 items-center font-bold text-blue underline underline-offset-4 ${className}`}
      >
        what&apos;s this?
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="your period score">
        <div className="flex flex-col gap-2">
          <p className="font-bold">{scoreProgress(score.value)}</p>
          <div
            role="meter"
            aria-label="period score"
            aria-valuemin={0}
            aria-valuemax={HEAVY_THRESHOLD}
            aria-valuenow={Math.min(score.value, HEAVY_THRESHOLD)}
            aria-valuetext={scoreProgress(score.value)}
            className="relative h-3 rounded-pill bg-track"
          >
            <span className="absolute inset-y-0 left-0 rounded-pill bg-red" style={{ width: `${pct}%` }} />
            <span aria-hidden="true" className="absolute -inset-y-1.5 w-0.5 bg-ink" style={{ left: `${line}%` }} />
          </div>
          <div aria-hidden="true" className="relative h-5 text-sm text-muted">
            <span className="absolute -translate-x-1/2" style={{ left: `${line}%` }}>
              100
            </span>
          </div>
        </div>

        <p>
          your period score adds up how soaked each pad was, plus clots, using the PBAC, a chart doctors have used since 1990.
        </p>

        <ul aria-label="points" className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-2.5">
              <span className="flex w-7 shrink-0 justify-center">{l.icon}</span>
              <span>
                {l.label} <span className="whitespace-nowrap font-bold tabular-nums">= {l.pts}</span>
              </span>
            </li>
          ))}
        </ul>

        <p>
          under 100 for a whole period is typical. 100 or more can mean heavy bleeding (more than 80 ml), which is worth a chat with
          a doctor.
        </p>
      </Dialog>
    </>
  );
}
