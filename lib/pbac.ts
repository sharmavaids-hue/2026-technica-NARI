// PBAC scoring (Higham, Shaw & O'Brien 1990). Plain rules, never AI.
// Pads: lightly stained 1, moderately soaked 5, completely soaked 20.
// Clots: small 1, large (quarter-sized or bigger) 5. Flooding/leak: 5.
// A total of 100+ in one period suggests heavy menstrual bleeding.

import type { BleedingLevel, Clot, ResultState, Score, Soak } from "./types";

export const SOAK_POINTS: Record<Soak, number> = { light: 1, moderate: 5, full: 20 };
export const CLOT_POINTS: Record<Clot, number> = { none: 0, small: 1, large: 5 };
export const LEAK_POINTS = 5;
export const HEAVY_THRESHOLD = 100;

export function padPoints(p: { soak: Soak; clot: Clot; leaked: boolean }): number {
  return SOAK_POINTS[p.soak] + CLOT_POINTS[p.clot] + (p.leaked ? LEAK_POINTS : 0);
}

/** Day bleeding level (0–5) from the sum of that day's pad points. */
export function bleedingLevel(points: number): BleedingLevel {
  if (points <= 0) return 0;
  if (points <= 5) return 1;
  if (points <= 10) return 2;
  if (points <= 20) return 3;
  if (points <= 35) return 4;
  return 5;
}

export const STATE_LABELS: Record<ResultState, string> = {
  typical: "looks typical so far",
  watch: "keep an eye on it",
  doctor: "worth a doctor chat",
  urgent: "get help now",
};

export function scoreOf(value: number): Score {
  const state: ResultState = value >= HEAVY_THRESHOLD ? "doctor" : "typical";
  return {
    value,
    fill: Math.min(value, HEAVY_THRESHOLD) / HEAVY_THRESHOLD,
    state,
    label: STATE_LABELS[state],
  };
}
