// Turns raw stored rows (RawState) into the view models in lib/types.ts.
// Pure functions: no database, no AI. Used by every action.

import { addDays, dateRange, diffDays, formatLong, formatMonthDay, formatMonthDayLong } from "./date";
import { gcalUrl } from "./gcal";
import { bleedingLevel, scoreOf } from "./pbac";
import { findPatterns } from "./patterns";
import { averageCycleLength, groupPeriods, predictNextStart, predictedDates } from "./predict";
import { bleedingStory, energyLink, GET_HELP, rapidFullPads } from "./signals";
import type {
  ChatMessage,
  Day,
  HomeData,
  ISODate,
  PadLog,
  Period,
  Profile,
  Rating,
  Signal,
} from "./types";

export interface RawDayLog {
  date: ISODate;
  isPeriod: boolean;
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
}

export interface RawState {
  profile: Profile;
  dayLogs: RawDayLog[];
  padLogs: PadLog[];
  messages: ChatMessage[];
}

export interface Derived {
  today: ISODate;
  days: Day[];
  dayMap: Map<ISODate, Day>;
  periods: Period[];
  current: Period | null;
  lastFinished: Period | null;
  scorePeriod: Period | null; // current, else latest
  periodDay: number | null;
  cycleLength: number;
  nextStart: ISODate | null;
  signals: Signal[];
}

export function derive(raw: RawState, today: ISODate): Derived {
  const { profile } = raw;
  const logMap = new Map(raw.dayLogs.map((l) => [l.date, l]));
  const padsByDate = new Map<ISODate, PadLog[]>();
  for (const p of raw.padLogs) {
    const list = padsByDate.get(p.date) ?? [];
    list.push(p);
    padsByDate.set(p.date, list);
  }
  for (const list of padsByDate.values()) list.sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));

  const periodDates = raw.dayLogs.filter((l) => l.isPeriod && l.date <= today).map((l) => l.date);
  for (const d of padsByDate.keys()) if (d <= today) periodDates.push(d);
  const runs = groupPeriods(periodDates);

  const pointsOn = (d: ISODate) => (padsByDate.get(d) ?? []).reduce((s, p) => s + p.points, 0);

  const periods: Period[] = runs.map((r) => {
    // a period is "current" if today is in it, or it was logged up to yesterday
    const isCurrent =
      today >= r.start && diffDays(r.end, today) <= 1 && diffDays(r.start, today) < 10;
    const end = isCurrent && today > r.end ? today : r.end;
    return {
      start: r.start,
      end,
      length: diffDays(r.start, end) + 1,
      score: dateRange(r.start, end).reduce((s, d) => s + pointsOn(d), 0),
      isCurrent,
    };
  });

  const current = periods.find((p) => p.isCurrent) ?? null;
  const finished = periods.filter((p) => !p.isCurrent);
  const lastFinished = finished[finished.length - 1] ?? null;
  const scorePeriod = current ?? lastFinished;
  const periodDay = current ? diffDays(current.start, today) + 1 : null;

  const cycleLength = averageCycleLength(runs, profile.cycleLength);
  const lastStart = runs.length ? runs[runs.length - 1].start : profile.lastPeriodStart;
  const nextStart = predictNextStart(lastStart, cycleLength, today);

  // predicted: rest of the current period + the next period
  const predicted = new Set<ISODate>();
  if (current) {
    for (const d of predictedDates(current.start, profile.periodLength)) if (d > today) predicted.add(d);
  }
  for (const d of predictedDates(nextStart, profile.periodLength)) predicted.add(d);

  const periodOf = (d: ISODate) => periods.find((p) => d >= p.start && d <= p.end) ?? null;

  const first = [addDays(today, -130), ...raw.dayLogs.map((l) => l.date), ...padsByDate.keys()].sort()[0];
  const days: Day[] = dateRange(first, addDays(today, 70)).map((date) => {
    const log = logMap.get(date);
    const pads = padsByDate.get(date) ?? [];
    const isPeriod = (log?.isPeriod ?? false) || pads.length > 0;
    const p = isPeriod ? periodOf(date) : null;
    const periodDay = p ? diffDays(p.start, date) + 1 : null;
    const isPredicted = !isPeriod && predicted.has(date);
    const padPoints = pointsOn(date);
    const parts = [formatMonthDayLong(date)];
    if (date === today) parts.push("today");
    if (periodDay) parts.push(`period day ${periodDay}`);
    else if (isPredicted) parts.push("predicted period");
    if (pads.length) parts.push(`${pads.length} pad${pads.length === 1 ? "" : "s"}`);
    return {
      date,
      isPeriod,
      isPredicted,
      isToday: date === today,
      periodDay,
      bleeding: bleedingLevel(padPoints),
      energy: log?.energy ?? null,
      discomfort: log?.discomfort ?? null,
      mood: log?.mood ?? null,
      activities: log?.activities ?? [],
      pads,
      padPoints,
      ariaLabel: parts.join(", "),
    };
  });
  const dayMap = new Map(days.map((d) => [d.date, d]));

  // signals (code rules, never AI)
  const signals: Signal[] = [];
  if (rapidFullPads(padsByDate.get(today) ?? [])) signals.push(GET_HELP);
  const energy = energyLink(current, days) ?? energyLink(lastFinished, days);
  if (energy) signals.push(energy);
  const maxScore = Math.max(current?.score ?? 0, lastFinished?.score ?? 0);
  const story = bleedingStory(profile.quiz, maxScore);
  if (story) signals.push(story);

  return {
    today,
    days,
    dayMap,
    periods,
    current,
    lastFinished,
    scorePeriod,
    periodDay,
    cycleLength,
    nextStart,
    signals,
  };
}

export function toHome(raw: RawState, d: Derived): HomeData {
  return {
    today: d.today,
    todayLabel: formatLong(d.today),
    periodDay: d.periodDay,
    daysUntilNext: d.nextStart ? diffDays(d.today, d.nextStart) : null,
    profile: raw.profile,
    score: scoreOf(d.scorePeriod?.score ?? 0),
    days: d.days,
    periods: d.periods,
    nextPeriodStart: d.nextStart,
    nextPeriodLabel: d.nextStart ? formatMonthDay(d.nextStart) : null,
    gcalUrl: d.nextStart ? gcalUrl(d.nextStart, raw.profile.periodLength) : null,
    signals: d.signals,
    patterns: findPatterns(d.periods, d.days),
  };
}
