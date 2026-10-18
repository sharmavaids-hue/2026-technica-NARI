// Health signals. Plain rules in code, never AI. Never diagnose.
// Copy is lowercase and calm, per BRIEF.md voice.

import { HEAVY_THRESHOLD } from "./pbac";
import type { Day, PadLog, Period, QuizAnswers, Signal } from "./types";

export const GET_HELP: Signal = {
  id: "get-help",
  state: "urgent",
  title: "this needs care today",
  body:
    "soaking through a pad every hour for a few hours, feeling dizzy or faint, severe pain, or bleeding when you might be pregnant needs care now. call 911 or go to the nearest ER. if you're unsure and it can wait a few hours, call the UMD Health Center.",
};

// Phrases that skip Gemini and show the get-help card right away.
const URGENT_PATTERNS: RegExp[] = [
  /\bdizz/i,
  /\bfaint/i,
  /passed out/i,
  /black(ed)? out/i,
  /light ?headed/i,
  /every (single )?hour/i,
  /soak(ed|ing)? (through )?(a |my )?(pad|tampon)s? (in|every) (an |1 )?h(ou)?r/i,
  /can'?t (stand|stand up|breathe|walk)/i,
  /\bpregnan/i,
  /worst pain/i,
  /severe pain/i,
  /chest pain/i,
  /\bhemorrhag/i,
];

// Crisis / self-harm language: answered with resources, never with AI.
const CRISIS_PATTERNS: RegExp[] = [
  /kill (my ?self|me)\b/i,
  /\bsuicid/i,
  /end (my|it all|my life)\b.*\b(life|all)?/i,
  /\bwant(ed)? to die\b/i,
  /\bself[- ]?harm/i,
  /\b(hurt|cut|harm)(ing)? my ?self\b/i,
  /no (reason|point) (to|in) (live|living|going on)/i,
  /don'?t want to (be here|live|exist)/i,
];

export const CRISIS_REPLY =
  "i'm really glad you told me, and i'm here. you don't have to carry this alone. you can call or text 988 (suicide & crisis lifeline) any time, or call the UMD counseling center at (301) 314-7651, day or night. if you're in danger right now, call 911.";

export function isCrisisText(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export function isUrgentText(text: string): boolean {
  return URGENT_PATTERNS.some((re) => re.test(text));
}

/** 3+ fully soaked pads logged within 3 hours. */
export function rapidFullPads(pads: PadLog[]): boolean {
  const times = pads
    .filter((p) => p.soak === "full")
    .map((p) => new Date(p.loggedAt).getTime())
    .sort((a, b) => a - b);
  for (let i = 0; i + 2 < times.length; i++) {
    if (times[i + 2] - times[i] <= 3 * 60 * 60 * 1000) return true;
  }
  return false;
}

/** Energy link: PBAC 100+ and energy ≤2 on more than half of logged days. */
export function energyLink(period: Period | null, days: Day[]): Signal | null {
  if (!period || period.score < HEAVY_THRESHOLD) return null;
  const inPeriod = days.filter(
    (d) => d.isPeriod && d.date >= period.start && d.date <= period.end && d.energy !== null,
  );
  if (!inPeriod.length) return null;
  const tired = inPeriod.filter((d) => (d.energy ?? 5) <= 2).length;
  if (tired * 2 <= inPeriod.length) return null;
  const which = period.isCurrent ? "this period" : "your last period";
  return {
    id: "energy-link",
    state: "doctor",
    title: "heavy bleeding + tired most days",
    body: `${which} scored ${period.score} and your energy was low on ${tired} of ${inPeriod.length} days. this can mean low iron. worth asking for a blood test (ferritin).`,
  };
}

export function quizYesCount(q: QuizAnswers): number {
  return [q.nosebleeds, q.bruising, q.procedures, q.family].filter((v) => v === true).length;
}

/** Bleeding Story: 2+ yes answers and a heavy period. */
export function bleedingStory(q: QuizAnswers, maxScore: number): Signal | null {
  const yes = quizYesCount(q);
  if (yes < 2 || maxScore < HEAVY_THRESHOLD) return null;
  return {
    id: "bleeding-story",
    state: "doctor",
    title: "your bleeding story",
    body: `heavy periods plus ${yes} of the bleeding signs in your quiz. worth asking a doctor about bleeding disorders like von willebrand disease. it's common and often missed.`,
  };
}
