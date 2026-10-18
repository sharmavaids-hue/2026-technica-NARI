import "server-only";

// Posts today's scheduled nari message (and resolves a stale "did it come?").
// Called from server actions (skip to tomorrow, demo reset, sendMessage) as
// well as when the chat page opens, so the message exists no matter which
// path the user takes. Duplicates are ignored by the store.

import type { Derived } from "./derive";
import { scheduledFor } from "./schedule";
import type { Store } from "./store/types";
import type { ChatMessage } from "./types";

export const byTime = (a: ChatMessage, b: ChatMessage) => Date.parse(a.createdAt) - Date.parse(b.createdAt);

/** Is today's "did your period come?" still waiting for an answer? */
export function didItComePending(messages: ChatMessage[], today: string): boolean {
  const sorted = [...messages].sort(byTime);
  const i = sorted.findLastIndex((m) => m.appDate === today && m.kind === "did-it-come");
  return i >= 0 && !sorted.slice(i + 1).some((m) => m.sender === "user" || m.kind === "nari");
}

export async function syncChat(store: Store, d: Derived, messages: ChatMessage[]): Promise<void> {
  const out: ChatMessage[] = [];
  const now = Date.now();
  if (d.periodDay && didItComePending(messages, d.today)) {
    // the period got logged some other way (pad, calendar edit): stop asking "did it come?"
    out.push({
      id: crypto.randomUUID(),
      appDate: d.today,
      sender: "nari",
      kind: "nari",
      body: `looks like your period's already on your calendar, so you're on day ${d.periodDay}. go easy on yourself today`,
      card: null,
      createdAt: new Date(now).toISOString(),
    });
  }
  for (const m of scheduledFor(d)) {
    out.push({ ...m, createdAt: new Date(now + 5 * (out.length + 1)).toISOString() });
  }
  if (out.length) await store.addMessages(out);
}
