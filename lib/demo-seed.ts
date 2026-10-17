// Demo data, built relative to the app date so the demo always looks fresh.
// Matches the mockups: today is day 2, score 48, next period ~28 days after
// yesterday. Three past periods scored ~112 / 127 / 146 with low energy on
// day 2, so the energy link and both patterns show up.

import { addDays } from "./date";
import { padPoints } from "./pbac";
import type { RawDayLog, RawState } from "./derive";
import type { ChatMessage, Clot, ISODate, PadLog, Profile, Rating, Soak } from "./types";

type PadSpec = [Soak, Clot?, boolean?];
interface DaySpec {
  pads: PadSpec[];
  energy?: Rating;
  discomfort?: Rating;
  mood?: Rating;
  activities?: string[];
}

const HOURS = ["08:10", "11:40", "14:30", "17:50", "21:15"];

// New York in October is UTC-4. Close enough for demo timestamps.
const at = (date: ISODate, hhmm: string) => `${date}T${hhmm}:00-04:00`;

function pastPeriod(extra: 0 | 1 | 2): DaySpec[] {
  // base ~112 points; extra adds heavier pads to make each period heavier
  const day2Extra: PadSpec[] = extra >= 1 ? [["moderate", "small"]] : [];
  const day3Extra: PadSpec[] = extra >= 2 ? [["full"]] : [];
  return [
    { pads: [["moderate"], ["full"], ["moderate"]], energy: 2, discomfort: 3, mood: 3, activities: ["class", "studied"] },
    { pads: [["full"], ["full", "small"], ["moderate", "large"], ...day2Extra], energy: 1, discomfort: 4, mood: 2, activities: ["skipped the gym", "napped"] },
    { pads: [["full"], ["moderate"], ...day3Extra], energy: 2, discomfort: 3, mood: 3, activities: ["class"] },
    { pads: [["moderate"], ["light"]], energy: 3, discomfort: 2, mood: 4, activities: ["went to the gym"] },
    { pads: [["light"]], energy: 4, discomfort: 1, mood: 4, activities: ["hung out with friends"] },
  ];
}

export function demoProfile(id: string, name = "arshia"): Profile {
  return {
    id,
    name,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: null,
    dayOffset: 0,
    quiz: { nosebleeds: null, bruising: null, procedures: null, family: null },
  };
}

export function buildDemoState(today: ISODate, profile: Profile): RawState {
  const dayLogs: RawDayLog[] = [];
  const padLogs: PadLog[] = [];

  const addPeriod = (start: ISODate, specs: DaySpec[]) => {
    specs.forEach((s, i) => {
      const date = addDays(start, i);
      dayLogs.push({
        date,
        isPeriod: true,
        energy: s.energy ?? null,
        discomfort: s.discomfort ?? null,
        mood: s.mood ?? null,
        activities: s.activities ?? [],
      });
      s.pads.forEach(([soak, clot = "none", leaked = false], j) => {
        padLogs.push({
          id: crypto.randomUUID(),
          date,
          loggedAt: at(date, HOURS[j] ?? "22:30"),
          soak,
          clot,
          leaked,
          points: padPoints({ soak, clot, leaked }),
          aiSoak: null,
          aiClot: null,
        });
      });
    });
  };

  const currentStart = addDays(today, -1);
  const starts = [addDays(currentStart, -84), addDays(currentStart, -57), addDays(currentStart, -28)];
  addPeriod(starts[0], pastPeriod(0));
  addPeriod(starts[1], pastPeriod(1));
  addPeriod(starts[2], pastPeriod(2));

  // current period: day 1 yesterday (25 pts), day 2 today (23 pts) = 48.
  // today's check-in is left empty so the demo can answer it in chat.
  addPeriod(currentStart, [
    { pads: [["full"], ["moderate"]], energy: 3, discomfort: 3, mood: 3, activities: ["class"] },
    { pads: [["full"], ["light"], ["light", "small"]] },
  ]);

  const yesterday = currentStart;
  const messages: ChatMessage[] = [
    {
      id: crypto.randomUUID(),
      appDate: yesterday,
      sender: "nari",
      kind: "did-it-come",
      body: "hey, today's the day your period was expected. did it come?",
      card: null,
      createdAt: at(yesterday, "09:02"),
    },
    {
      id: crypto.randomUUID(),
      appDate: yesterday,
      sender: "user",
      kind: "reply",
      body: "yes",
      card: null,
      createdAt: at(yesterday, "09:05"),
    },
    {
      id: crypto.randomUUID(),
      appDate: yesterday,
      sender: "nari",
      kind: "nari",
      body: "logged it. day 1 is on your calendar. go easy on yourself today",
      card: null,
      createdAt: at(yesterday, "09:05"),
    },
  ];

  return {
    profile: { ...profile, lastPeriodStart: currentStart },
    dayLogs,
    padLogs,
    messages,
  };
}
