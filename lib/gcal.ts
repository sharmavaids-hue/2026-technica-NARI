// Pre-filled Google Calendar event link (no OAuth, no sync).

import { addDays } from "./date";
import type { ISODate } from "./types";

const compact = (d: ISODate) => d.replaceAll("-", "");

export function gcalUrl(start: ISODate, periodLength: number): string {
  const end = addDays(start, periodLength); // all-day end date is exclusive
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "period (predicted) · nari",
    dates: `${compact(start)}/${compact(end)}`,
    details:
      "nari's prediction for your next period. pack a pad, maybe plan an easy day 2.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
