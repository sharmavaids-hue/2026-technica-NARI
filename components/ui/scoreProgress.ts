import { HEAVY_THRESHOLD } from "@/lib/pbac";

/** "48 of 100 so far this period" / "128, past the 100 line this period" */
export function scoreProgress(value: number) {
  return value >= HEAVY_THRESHOLD
    ? `${value}, past the ${HEAVY_THRESHOLD} line this period`
    : `${value} of ${HEAVY_THRESHOLD} so far this period`;
}
