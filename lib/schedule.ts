// Nari's scheduled messages. Created when the user opens the app (no push).
// One per (day, kind); the store ignores duplicates on refresh.

import { diffDays } from "./date";
import type { Derived } from "./derive";
import type { ChatMessage, MessageKind } from "./types";

function msg(today: string, kind: MessageKind, body: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    appDate: today,
    sender: "nari",
    kind,
    body,
    card: null,
    createdAt: new Date().toISOString(),
  };
}

export function scheduledFor(d: Derived): ChatMessage[] {
  const { today, periodDay, nextStart } = d;
  if (periodDay) {
    const body =
      periodDay === 1
        ? "hey, day 1. you good? how's your energy, and what did you get up to today?"
        : `hey, day ${periodDay}. you good? how's your energy, and what did you get up to today?`;
    return [msg(today, "checkin", body)];
  }
  if (!nextStart) return [];
  const until = diffDays(today, nextStart);
  if (until === 2) {
    return [msg(today, "heads-up", "hey, your period's probably coming in 2 days. maybe pack a pad?")];
  }
  if (until === 0) {
    return [msg(today, "did-it-come", "hey, today's the day your period was expected. did it come?")];
  }
  if (until < 0 && until >= -7) {
    return [msg(today, "did-it-come", "hey, no period logged yet. cycles shift, that's normal. did it come today?")];
  }
  return [];
}
