// Simple patterns from code, not AI. Only shown with 2+ past periods.

import type { Day, Pattern, Period } from "./types";

export function findPatterns(periods: Period[], days: Day[]): Pattern[] {
  const past = periods.filter((p) => !p.isCurrent);
  if (past.length < 2) return [];
  const out: Pattern[] = [];

  // lowest energy day, averaged over every period
  const byDay = new Map<number, number[]>();
  for (const d of days) {
    if (d.periodDay && d.energy !== null) {
      const list = byDay.get(d.periodDay) ?? [];
      list.push(d.energy);
      byDay.set(d.periodDay, list);
    }
  }
  let lowest: { day: number; avg: number } | null = null;
  for (const [day, vals] of byDay) {
    if (vals.length < 2) continue;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (!lowest || avg < lowest.avg) lowest = { day, avg };
  }
  if (lowest && lowest.avg <= 3) {
    out.push({
      id: "lowest-energy-day",
      text: `your energy dips on day ${lowest.day}. it did last month too, so maybe plan an easy day.`,
    });
  }

  // last finished period vs the one before
  const [prev, last] = past.slice(-2);
  if (prev.score > 0 && last.score > 0) {
    const change = (last.score - prev.score) / prev.score;
    if (change >= 0.1) {
      out.push({
        id: "heavier-than-last",
        text: `your last period was heavier than the one before (${last.score} vs ${prev.score} points).`,
      });
    } else if (change <= -0.1) {
      out.push({
        id: "lighter-than-last",
        text: `your last period was lighter than the one before (${last.score} vs ${prev.score} points).`,
      });
    }
  }
  return out;
}
