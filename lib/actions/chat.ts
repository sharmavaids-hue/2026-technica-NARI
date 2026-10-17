"use server";

import { revalidatePath } from "next/cache";
import { loadAll } from "../app-state";
import { derive } from "../derive";
import { parseCheckin } from "../gemini";
import { scheduledFor } from "../schedule";
import { GET_HELP, isUrgentText } from "../signals";
import type { ChatCard, ChatData, ChatMessage, MessageKind, Rating } from "../types";

function make(today: string, sender: "nari" | "user", kind: MessageKind, body: string, card: ChatCard | null = null, offsetMs = 0): ChatMessage {
  return {
    id: crypto.randomUUID(),
    appDate: today,
    sender,
    kind,
    body,
    card,
    createdAt: new Date(Date.now() + offsetMs).toISOString(),
  };
}

/** Is today's "did your period come?" still waiting for an answer? */
function didItComePending(messages: ChatMessage[], today: string): boolean {
  const i = messages.findLastIndex((m) => m.appDate === today && m.kind === "did-it-come");
  return i >= 0 && !messages.slice(i + 1).some((m) => m.sender === "user");
}

/** Open the chat: adds today's scheduled message (once) and returns history. */
export async function getChat(): Promise<ChatData> {
  const { store, d } = await loadAll();
  await store.addMessages(scheduledFor(d));
  const raw = await store.load();
  const pending = didItComePending(raw.messages, d.today);
  return {
    today: d.today,
    messages: [...raw.messages].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    quickReplies: pending
      ? ["yes", "not yet"]
      : d.periodDay
        ? ["log a pad", "not now", "i feel worse"]
        : ["i feel worse"],
  };
}

/** The user sends a text (typed or a quick reply). Returns the updated chat. */
export async function sendMessage(text: string): Promise<ChatData> {
  const t = String(text ?? "").trim().slice(0, 1000);
  if (!t) return getChat();
  const { store, d } = await loadAll();
  await store.addMessages(scheduledFor(d)); // today's question always comes before the reply
  const raw = await store.load();
  const today = d.today;
  const lower = t.toLowerCase();
  const out: ChatMessage[] = [make(today, "user", "reply", t)];
  const nari = (body: string, kind: MessageKind = "nari", card: ChatCard | null = null) =>
    out.push(make(today, "nari", kind, body, card, out.length * 5));

  if (isUrgentText(t)) {
    // safety first: keyword check runs before any AI
    nari("that sounds like it needs care now. you don't have to figure this out alone.", "get-help", { type: "get-help" });
  } else if (didItComePending(raw.messages, today) && /^(yes|yep|yeah|ya|yup|it did|it came)\b/.test(lower)) {
    const existing = raw.dayLogs.find((l) => l.date === today);
    await store.upsertDay({
      date: today,
      isPeriod: true,
      energy: existing?.energy ?? null,
      discomfort: existing?.discomfort ?? null,
      mood: existing?.mood ?? null,
      activities: existing?.activities ?? [],
    });
    await store.updateProfile({ lastPeriodStart: today });
    nari("logged it. day 1 is on your calendar. go easy on yourself today");
  } else if (didItComePending(raw.messages, today) && /^(no|nope|not yet|nah)\b/.test(lower)) {
    nari("ok, no stress. cycles can shift a few days. i'll check again tomorrow.");
  } else if (lower === "not now") {
    nari("ok, i'll check in tomorrow. i'm here if anything changes.");
  } else if (lower === "i feel worse") {
    nari(
      "i'm sorry. if you're soaking a pad every hour, feeling dizzy, or in severe pain, please get care now. otherwise, tell me what's going on.",
      "get-help",
      { type: "get-help" },
    );
  } else if (lower === "log a pad") {
    nari("tap pad check to log it. it takes three taps.");
  } else if (d.periodDay) {
    const parsed = await parseCheckin(t, d.periodDay);
    const manual = !parsed || (parsed.energy === null && parsed.discomfort === null && parsed.mood === null);
    nari(manual ? "i couldn't catch the numbers this time. can you set them?" : "got it. here's what i heard:", "bars", {
      type: "bars",
      date: today,
      energy: parsed?.energy ?? null,
      discomfort: parsed?.discomfort ?? null,
      mood: parsed?.mood ?? null,
      activities: parsed?.activities ?? [],
      confirmed: false,
      manual,
    });
    nari(parsed?.reply || "thanks for telling me. want to log a pad while you're here?");
  } else {
    nari("i check in during your period and around when it's due. if something feels off, tap \"i feel worse\".");
  }

  await store.addMessages(out);
  revalidatePath("/app", "layout");
  return getChat();
}

/** "looks right" (or saving after "adjust") on a bars card. */
export async function confirmCheckin(
  messageId: string,
  values: { energy: Rating | null; discomfort: Rating | null; mood: Rating | null; activities: string[] },
): Promise<ChatData> {
  const { store, raw, d } = await loadAll();
  const msg = raw.messages.find((m) => m.id === messageId);
  if (!msg || msg.card?.type !== "bars") return getChat();
  const ok = (v: unknown): Rating | null => (typeof v === "number" && v >= 1 && v <= 5 ? (Math.round(v) as Rating) : null);
  const card: ChatCard = {
    ...msg.card,
    energy: ok(values.energy),
    discomfort: ok(values.discomfort),
    mood: ok(values.mood),
    activities: (values.activities ?? []).map((a) => String(a).toLowerCase().trim()).filter(Boolean).slice(0, 8),
    confirmed: true,
    manual: false,
  };
  await store.updateMessageCard(messageId, card);

  const existing = raw.dayLogs.find((l) => l.date === card.date);
  const log = {
    date: card.date,
    isPeriod: existing?.isPeriod ?? Boolean(d.current && card.date >= d.current.start),
    energy: card.energy,
    discomfort: card.discomfort,
    mood: card.mood,
    activities: card.activities,
  };
  await store.upsertDay(log);

  // any new health signal? post it once as a card in the chat
  const after = derive({ ...raw, dayLogs: [...raw.dayLogs.filter((l) => l.date !== log.date), log] }, d.today);
  const posted = new Set(
    raw.messages.flatMap((m) => (m.card?.type === "signal" ? [m.card.signal.id] : [])),
  );
  const fresh = after.signals.filter((s) => s.id !== GET_HELP.id && !posted.has(s.id));
  await store.addMessages(
    fresh.map((s, i) => make(d.today, "nari", "signal", "one thing i noticed:", { type: "signal", signal: s }, i * 5)),
  );
  revalidatePath("/app", "layout");
  return getChat();
}
