// Shared data shapes. This file is the contract between the UI (Arshia)
// and the backend (Aryan). Components import types from here and call
// functions from lib/actions/*. Dates are always "YYYY-MM-DD" strings in
// America/New_York (see lib/date.ts).

export type ISODate = string; // "2026-10-17"

export type Soak = "light" | "moderate" | "full";
export type Clot = "none" | "small" | "large";

/** 1–5 rating from a check-in. null = not logged. */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** 0–5, computed from that day's pad points. Never stored. */
export type BleedingLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Result states. Always show icon + words, never color alone. */
export type ResultState = "typical" | "watch" | "doctor" | "urgent";

export interface QuizAnswers {
  nosebleeds: boolean | null; // nosebleeds lasting over 10 minutes
  bruising: boolean | null; // bruising easily
  procedures: boolean | null; // heavy bleeding after dental work or surgery
  family: boolean | null; // family history of a bleeding disorder
}

export interface Profile {
  id: string;
  name: string;
  cycleLength: number; // days, default 28
  periodLength: number; // days, default 5
  lastPeriodStart: ISODate | null;
  dayOffset: number; // demo "skip to tomorrow"
  quiz: QuizAnswers;
}

export interface PadLog {
  id: string;
  date: ISODate;
  loggedAt: string; // full ISO timestamp
  soak: Soak;
  clot: Clot;
  leaked: boolean;
  points: number;
  aiSoak: Soak | null; // what Gemini guessed (null = no guess)
  aiClot: Clot | null;
}

/** One calendar day, fully derived and ready to render. */
export interface Day {
  date: ISODate;
  isPeriod: boolean; // logged period day
  isPredicted: boolean; // predicted (and not logged)
  isToday: boolean;
  periodDay: number | null; // 1-based day of its period, if a period day
  bleeding: BleedingLevel; // computed from pads
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
  pads: PadLog[];
  padPoints: number; // sum of this day's pad points
  /** Screen-reader label, e.g. "october 17, period day 2, 3 pads" */
  ariaLabel: string;
}

export interface Period {
  start: ISODate;
  end: ISODate; // last logged day (may still be ongoing)
  length: number;
  score: number; // PBAC total
  isCurrent: boolean; // today is inside it
}

export type SignalId = "get-help" | "energy-link" | "bleeding-story";

export interface Signal {
  id: SignalId;
  state: ResultState;
  title: string; // lowercase, short
  body: string;
}

export interface Pattern {
  id: "lowest-energy-day" | "heavier-than-last" | "lighter-than-last";
  text: string;
}

export interface Score {
  value: number; // PBAC points for the current (or latest) period
  fill: number; // 0–1 for the sphere, min(value,100)/100
  state: ResultState;
  label: string; // "looks typical so far" / "worth a doctor chat"
}

export interface HomeData {
  today: ISODate;
  todayLabel: string; // "saturday, october 17"
  periodDay: number | null; // "day 2 of your period." (null = not on period)
  daysUntilNext: number | null;
  profile: Profile;
  score: Score;
  days: Day[]; // every day from 4+ months back to ~13 months ahead
  periods: Period[];
  nextPeriodStart: ISODate | null;
  nextPeriodLabel: string | null; // "nov 13"
  gcalUrl: string | null;
  signals: Signal[];
  patterns: Pattern[];
}

export interface DayInput {
  date: ISODate;
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
}

export interface PadInput {
  soak: Soak;
  clot: Clot;
  leaked: boolean;
  aiSoak: Soak | null;
  aiClot: Clot | null;
  date?: ISODate; // defaults to today
}

/** Why a photo guess failed, so the UI can say something useful. */
export type PadFailReason =
  | "no-key" // no Gemini key on the server
  | "busy" // Gemini overloaded or out of quota: "nari's AI is busy, pick it yourself"
  | "timeout"
  | "blocked" // Gemini's safety filter refused the image
  | "not-a-pad" // Gemini didn't see a pad in the photo
  | "bad-photo" // missing, too big, or not an image
  | "error";

export interface PadGuess {
  soak: Soak | null;
  clot: Clot | null;
  ok: boolean; // false = no guess; let the user pick
  reason: PadFailReason | null; // set when ok is false
}

export interface PadCheckData {
  today: ISODate;
  score: Score;
  todayPads: PadLog[];
  signals: Signal[]; // includes get-help if rapid full pads were logged
}

export interface SavePadResult {
  pad: PadLog;
  added: number; // "+6 points with this pad"
  before: number; // score before, for the count-up animation
  score: Score;
  signals: Signal[];
}

// ---------- chat ----------

export type MessageKind =
  | "checkin" // daily check-in question during the period
  | "heads-up" // 2 days before predicted start
  | "did-it-come" // on predicted start day
  | "reply" // anything the user typed
  | "nari" // nari's normal reply
  | "bars" // bars card after a check-in
  | "signal"
  | "get-help";

export type ChatCard =
  | {
      type: "bars";
      date: ISODate;
      energy: Rating | null;
      discomfort: Rating | null;
      mood: Rating | null;
      activities: string[];
      confirmed: boolean;
      /** true when Gemini failed: ask the user to set the values */
      manual: boolean;
    }
  | { type: "signal"; signal: Signal }
  | { type: "get-help" };

export interface ChatMessage {
  id: string;
  appDate: ISODate;
  sender: "nari" | "user";
  kind: MessageKind;
  body: string;
  card: ChatCard | null;
  createdAt: string; // ISO timestamp
}

export interface ChatData {
  today: ISODate;
  messages: ChatMessage[]; // oldest first
  quickReplies: string[]; // e.g. ["yes", "not yet"] or ["log a pad", "not now", "i feel worse"]
}

// ---------- doctor page ----------

export interface DoctorData {
  name: string;
  generatedOn: string; // "october 17, 2026"
  period: Period | null; // the period summarized (current, else latest)
  score: Score;
  padsPerDay: { date: ISODate; periodDay: number; pads: number; points: number }[];
  maxPadsInADay: number;
  days: Day[]; // that period's days, for the bars table
  signals: Signal[];
  patterns: Pattern[];
  script: string; // what to say, filled with real numbers
  visitReason: string; // copied to clipboard before opening the booking page
  bookingUrl: string;
}

// ---------- settings ----------

export interface SettingsInput {
  name: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: ISODate | null;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}
