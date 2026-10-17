// Period grouping and prediction. Simple math, no AI:
// next start = last period start + average cycle length.

import { addDays, diffDays } from "./date";
import type { ISODate } from "./types";

export interface Run {
  start: ISODate;
  end: ISODate;
  dates: ISODate[];
}

/**
 * Group period dates into periods. Days with a gap of 1 day are still the
 * same period (people skip logging a day), bigger gaps start a new one.
 */
export function groupPeriods(periodDates: ISODate[]): Run[] {
  const sorted = [...new Set(periodDates)].sort();
  const runs: Run[] = [];
  for (const d of sorted) {
    const last = runs[runs.length - 1];
    if (last && diffDays(last.end, d) <= 2) {
      last.end = d;
      last.dates.push(d);
    } else {
      runs.push({ start: d, end: d, dates: [d] });
    }
  }
  return runs;
}

/** Average gap between period starts (last 6), else the user's setting. */
export function averageCycleLength(runs: Run[], fallback: number): number {
  const starts = runs.map((r) => r.start).slice(-7);
  if (starts.length < 2) return fallback;
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) gaps.push(diffDays(starts[i - 1], starts[i]));
  const sane = gaps.filter((g) => g >= 15 && g <= 60);
  if (!sane.length) return fallback;
  return Math.round(sane.reduce((a, b) => a + b, 0) / sane.length);
}

/**
 * Next predicted start. If the predicted date has already passed with no
 * period logged, keep the late prediction (so "did your period come?" can ask)
 * until 7 days late, then roll forward by whole cycles.
 */
export function predictNextStart(
  lastStart: ISODate | null,
  cycleLength: number,
  today: ISODate,
): ISODate | null {
  if (!lastStart) return null;
  let next = addDays(lastStart, cycleLength);
  while (diffDays(next, today) > 7) next = addDays(next, cycleLength);
  return next;
}

export function predictedDates(start: ISODate | null, periodLength: number): ISODate[] {
  if (!start) return [];
  return Array.from({ length: periodLength }, (_, i) => addDays(start, i));
}
