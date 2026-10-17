// App dates. Every "today" in Nari comes from getAppDate(), never raw new Date().
// Dates are "YYYY-MM-DD" strings in America/New_York, so a Vercel server
// running in UTC at 9pm Maryland time still agrees with the user's phone.
// Safe to import from both server and client code.

import type { ISODate } from "./types";

export const APP_TZ = "America/New_York";

const ymd = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Real calendar date in New York right now. */
export function realToday(now: Date = new Date()): ISODate {
  return ymd.format(now);
}

/** Today's app date: New York date + the demo day offset. */
export function getAppDate(dayOffset = 0, now: Date = new Date()): ISODate {
  return addDays(realToday(now), dayOffset);
}

function toUTC(d: ISODate): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

function fromUTC(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(d: ISODate, n: number): ISODate {
  return fromUTC(toUTC(d) + n * 86_400_000);
}

/** b - a in whole days. */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

export function isBefore(a: ISODate, b: ISODate): boolean {
  return a < b; // ISO strings sort correctly
}

/** Inclusive list of dates from a to b. */
export function dateRange(a: ISODate, b: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
  return out;
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });

const longFmt = fmt({ weekday: "long", month: "long", day: "numeric" });
const shortFmt = fmt({ weekday: "short", month: "short", day: "numeric" });
const monthDayFmt = fmt({ month: "short", day: "numeric" });
const monthDayLongFmt = fmt({ month: "long", day: "numeric" });
const fullFmt = fmt({ month: "long", day: "numeric", year: "numeric" });

const asDate = (d: ISODate) => new Date(toUTC(d));

/** "saturday, october 17" */
export const formatLong = (d: ISODate) => longFmt.format(asDate(d)).toLowerCase();
/** "sat, oct 17" */
export const formatShort = (d: ISODate) => shortFmt.format(asDate(d)).toLowerCase();
/** "nov 13" */
export const formatMonthDay = (d: ISODate) => monthDayFmt.format(asDate(d)).toLowerCase();
/** "october 17" */
export const formatMonthDayLong = (d: ISODate) => monthDayLongFmt.format(asDate(d)).toLowerCase();
/** "october 17, 2026" */
export const formatFull = (d: ISODate) => fullFmt.format(asDate(d)).toLowerCase();

/** Monday-first weekday index 0–6. */
export function weekdayMon0(d: ISODate): number {
  return (asDate(d).getUTCDay() + 6) % 7;
}
