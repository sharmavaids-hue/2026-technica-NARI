"use server";

import { revalidatePath } from "next/cache";
import { loadAll } from "../app-state";
import { diffDays, formatMonthDay } from "../date";
import { derive } from "../derive";
import { chatTurn } from "../gemini";
import { byTime, didItComePending, syncChat } from "../chat-sync";
import { CRISIS_REPLY, GET_HELP, isCrisisText, isUrgentText } from "../signals";
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

// used only when Gemini can't answer: warm, varied, never the same line twice in a row
const FALLBACKS_PERIOD = [
  "i'm here. tell me a bit more about how today's going?",
  "i hear you. what's been the hardest part of today so far?",
  "that's a lot to deal with on top of your period. what would make tonight a little easier?",
  "thanks for telling me. is it more the cramps or the tired that's getting to you right now?",
];
const FALLBACKS_OTHER = [
  "i'm here. tell me a bit more?",
  "i'm listening. what's on your mind?",
  "thanks for telling me. how are you feeling about it?",
];

function pickFallback(messages: ChatMessage[], periodDay: number | null): string {
  const pool = periodDay ? FALLBACKS_PERIOD : FALLBACKS_OTHER;
  const used = new Set(messages.filter((m) => m.sender === "nari").slice(-8).map((m) => m.body));
  return pool.find((line) => !used.has(line)) ?? pool[messages.length % pool.length];
}

type BarsCard = Extract<ChatCard, { type: "bars" }>;

/** Today's latest bars card, if any. */
function todaysBars(messages: ChatMessage[], today: string): BarsCard | null {
  const m = [...messages].sort(byTime).findLast((x) => x.appDate === today && x.card?.type === "bars");
  return m?.card?.type === "bars" ? m.card : null;
}

/** Open the chat: adds today's scheduled message (once) and returns history. */
export async function getChat(): Promise<ChatData> {
  const { store, raw: before, d } = await loadAll();
  await syncChat(store, d, before.messages);
  const raw = await store.load();

  const pending = !d.periodDay && didItComePending(raw.messages, d.today);
  return {
    today: d.today,
    messages: [...raw.messages].sort(byTime),
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
  const { store, raw: before, d } = await loadAll();
  await syncChat(store, d, before.messages); // today's question always comes before the reply
  const raw = await store.load();
  const today = d.today;
  const lower = t.toLowerCase();
  const pending = !d.periodDay && didItComePending(raw.messages, today);
  const out: ChatMessage[] = [make(today, "user", "reply", t)];
  const nari = (body: string, kind: MessageKind = "nari", card: ChatCard | null = null) =>
    out.push(make(today, "nari", kind, body, card, out.length * 5));

  // safety first: plain-code checks run before any AI
  if (isCrisisText(t)) {
    nari(CRISIS_REPLY);
  } else if (isUrgentText(t)) {
    nari("that sounds like it needs care now. you don't have to figure this out alone.", "get-help", { type: "get-help" });
  } else if (pending && /^(yes|yep|yeah|ya|yup|it did|it came)\b/.test(lower)) {
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
  } else if (pending && /^(no|nope|not yet|nah)\b/.test(lower)) {
    nari("ok, no stress. cycles can shift a few days. i'll check again tomorrow.");
  } else if (lower === "not now") {
    nari("ok, no pressure. i'm here if anything changes.");
  } else if (lower === "i feel worse") {
    nari(
      "i'm sorry. if you're soaking a pad every hour, feeling dizzy, or in severe pain, please get care now. otherwise, tell me what's going on.",
      "get-help",
      { type: "get-help" },
    );
  } else if (lower === "log a pad") {
    nari("tap pad check to log it. it takes three taps.");
  } else {
    const history = [...raw.messages]
      .sort(byTime)
      .filter((m) => m.card?.type !== "bars" && m.card?.type !== "signal")
      .slice(-15)
      .map((m) => ({ sender: m.sender, body: m.body }));
    const turn = await chatTurn(t, {
      today,
      periodDay: d.periodDay,
      nextPeriod: d.nextStart ? formatMonthDay(d.nextStart) : null,
      daysUntilNext: d.nextStart ? diffDays(today, d.nextStart) : null,
      history,
    });

    if (turn?.crisis) {
      nari(CRISIS_REPLY);
    } else {
      if (d.periodDay) {
        const prev = todaysBars(raw.messages, today);
        const hasNumbers = Boolean(turn && (turn.energy || turn.discomfort || turn.mood));
        if (!turn && !prev) {
          // Gemini failed and there's no card yet today: let her set the numbers herself
          nari("i couldn't catch the numbers this time. can you set them?", "bars", {
            type: "bars", date: today, energy: null, discomfort: null, mood: null, activities: [], confirmed: false, manual: true,
          });
        } else if (turn && hasNumbers) {
          const next: BarsCard = {
            type: "bars",
            date: today,
            energy: turn.energy ?? prev?.energy ?? null,
            discomfort: turn.discomfort ?? prev?.discomfort ?? null,
            mood: turn.mood ?? prev?.mood ?? null,
            activities: [...new Set([...(prev?.activities ?? []), ...turn.activities])].slice(0, 6),
            confirmed: false,
            manual: false,
          };
          const changed =
            !prev ||
            next.energy !== prev.energy ||
            next.discomfort !== prev.discomfort ||
            next.mood !== prev.mood ||
            next.activities.length !== prev.activities.length;
          // one bars card a day, unless what she said changes the numbers
          if (changed) nari(prev ? "updated what i heard:" : "got it. here's what i heard:", "bars", next);
        }
      }
      nari(turn?.reply || pickFallback(raw.messages, d.periodDay));
    }
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
