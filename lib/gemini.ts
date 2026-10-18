import "server-only";

// Gemini helpers. Server only (the key never reaches the browser).
// Every call has a timeout and never throws, so the manual fallback always
// works and the demo never depends on Gemini.
//
// Models: GEMINI_MODEL first, then a chain of fallbacks. Each Google model has
// its own free-tier quota, so when one is busy (503) or out of quota (429) we
// try the next one and skip the tired model for a while.

import { GoogleGenAI } from "@google/genai";
import type { Clot, PadColor, PadFailReason, Rating, Soak } from "./types";

const TEXT_TIMEOUT_MS = 12_000;
const IMAGE_TIMEOUT_MS = 18_000; // photo guesses take ~8-9s on gemini-3.8-flash

const PRIMARY = process.env.GEMINI_MODEL || "gemini-flash-latest";
const FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS ||
  "gemini-3.5-flash,gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const MODELS = [...new Set([PRIMARY, ...FALLBACKS])];

let client: GoogleGenAI | null = null;
function ai(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

// model -> time (ms) until we try it again. Lives as long as the server instance.
const coolUntil = new Map<string, number>();
const deadModels = new Set<string>(); // 404: wrong/retired model ID, never retry
const lastErrorByModel = new Map<string, string>(); // for /api/health

export type GeminiFail = Exclude<PadFailReason, "not-a-pad">;

export interface GeminiResult {
  ok: boolean;
  data: unknown;
  model: string | null;
  reason: GeminiFail | null;
  error: string | null;
}

let lastResult: GeminiResult | null = null;

function classify(msg: string): "dead" | "quota" | "busy" | "other" {
  if (/not.?found|404|is not supported|unknown model|invalid model/i.test(msg)) return "dead";
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) return "quota";
  if (/503|UNAVAILABLE|high demand|overloaded|500|INTERNAL/i.test(msg)) return "busy";
  return "other";
}

async function askJson(
  contents: unknown,
  schema: object,
  { timeoutMs = TEXT_TIMEOUT_MS, system, label }: { timeoutMs?: number; system?: string; label: string },
): Promise<GeminiResult> {
  const g = ai();
  if (!g) return (lastResult = { ok: false, data: null, model: null, reason: "no-key", error: "no GEMINI_API_KEY" });

  const deadline = Date.now() + timeoutMs;
  let sawBusy = false;
  let lastErr = "no model available";

  for (const model of MODELS) {
    if (deadModels.has(model) || (coolUntil.get(model) ?? 0) > Date.now()) continue;
    const left = deadline - Date.now();
    if (left < 1500) break;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), left);
    try {
      const res = await g.models.generateContent({
        model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contents: contents as any,
        config: {
          ...(system ? { systemInstruction: system } : {}),
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          abortSignal: controller.signal,
          temperature: 0.7,
        },
      });
      const cand = res.candidates?.[0];
      const blocked = res.promptFeedback?.blockReason;
      const finish = cand?.finishReason;
      if (blocked || !res.text) {
        // log why (never the content itself)
        console.warn(`[gemini:${label}] no answer from ${model}`, {
          blockReason: blocked ?? null,
          finishReason: finish ?? null,
          safety: (cand?.safetyRatings ?? res.promptFeedback?.safetyRatings ?? [])
            .filter((r) => r.probability && r.probability !== "NEGLIGIBLE")
            .map((r) => `${r.category}:${r.probability}`),
        });
        return (lastResult = { ok: false, data: null, model, reason: "blocked", error: `blocked (${blocked ?? finish ?? "empty"})` });
      }
      lastErrorByModel.delete(model);
      return (lastResult = { ok: true, data: JSON.parse(res.text), model, reason: null, error: null });
    } catch (err) {
      const e = err as Error;
      if (e.name === "AbortError" || controller.signal.aborted) {
        console.warn(`[gemini:${label}] ${model} timed out`);
        return (lastResult = { ok: false, data: null, model, reason: "timeout", error: `timed out after ${timeoutMs / 1000}s` });
      }
      lastErr = (e.message ?? String(err)).slice(0, 500);
      const kind = classify(lastErr);
      lastErrorByModel.set(model, `${kind}: ${(lastErr.match(/"message":"([^"]{0,160})/)?.[1] ?? lastErr).slice(0, 160)}`);
      console.warn(`[gemini:${label}] ${model} failed (${kind}): ${lastErr.slice(0, 200)}`);
      if (kind === "dead") deadModels.add(model);
      else if (kind === "quota") { coolUntil.set(model, Date.now() + 2 * 60_000); sawBusy = true; }
      else if (kind === "busy") { coolUntil.set(model, Date.now() + 60_000); sawBusy = true; }
      else return (lastResult = { ok: false, data: null, model, reason: "error", error: lastErr });
    } finally {
      clearTimeout(timer);
    }
  }
  return (lastResult = { ok: false, data: null, model: null, reason: sawBusy ? "busy" : "error", error: lastErr });
}

/** For /api/health?gemini=1. */
export async function geminiSelfTest() {
  const r = await askJson('Reply with {"hi": "there"}', {
    type: "object",
    properties: { hi: { type: "string" } },
    required: ["hi"],
  }, { label: "health" });
  return {
    ok: r.ok,
    model: r.model,
    sample: r.data,
    reason: r.reason,
    error: r.error,
    tried: MODELS,
    coolingDown: [...coolUntil.entries()].filter(([, t]) => t > Date.now()).map(([m]) => m),
    retired: [...deadModels],
    errors: Object.fromEntries(lastErrorByModel),
  };
}

export const lastGemini = () => lastResult;

// ---------- chat turn (reply + check-in numbers) ----------

export interface ChatTurn {
  reply: string;
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
  mentionsPadChange: boolean;
  mentionsDeadline: boolean;
  crisis: boolean;
}

export interface ChatContext {
  today: string;
  periodDay: number | null;
  nextPeriod: string | null; // "nov 13"
  daysUntilNext: number | null;
  padsToday: string | null; // e.g. "4 pads today: 2 full, 1 small clot"
  history: { sender: "nari" | "user"; body: string }[]; // oldest first, last ~15
}

const rating = { type: ["integer", "null"], minimum: 1, maximum: 5 };

const TURN_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "nari's message: 1-4 short lowercase sentences. may be split into 2 bubbles with a blank line (\\n\\n)",
    },
    energy: { ...rating, description: "1 = exhausted, 5 = full of energy. null unless what she said shows it" },
    discomfort: { ...rating, description: "1 = no pain/cramps, 5 = severe. null unless what she said shows it" },
    mood: { ...rating, description: "1 = very low, 5 = great. null unless what she said shows it" },
    activities: {
      type: "array",
      items: { type: "string" },
      description: "2-4 word lowercase chips of what she did today, e.g. 'skipped the gym', 'studied', 'slept 5 hrs'. max 4. empty if none",
    },
    mentionsPadChange: { type: "boolean", description: "she mentions changing, soaking or checking a pad/tampon" },
    mentionsDeadline: { type: "boolean", description: "she mentions an exam, assignment or deadline" },
    crisis: { type: "boolean", description: "she sounds hopeless, unsafe, or mentions hurting herself" },
  },
  required: ["reply", "energy", "discomfort", "mood", "activities", "mentionsPadChange", "mentionsDeadline", "crisis"],
};

// From CHAT_PROMPT.md (Arshia). The reply is the main job; numbers are secondary.
const NARI_SYSTEM = `You are nari, a warm, calm friend who checks in on a college student during her period. You are not a doctor and you never diagnose.

How you talk:
- lowercase, casual, short. 1-4 sentences. like texting a close friend who's good at listening.
- no corporate empathy. never say "i'm so sorry to hear that", "that sounds difficult", "how's the rest of your day going?", or "i'll check in tomorrow". no generic filler.
- reflect the specific thing she said, in her words, so she feels heard. ("cramps AND a chem exam tomorrow? that's a brutal combo.")
- validate before you suggest anything. her feelings make sense; don't rush to fix.
- then offer ONE small, concrete, doable comfort, matched to what she said (heat pad or hot water bottle on her lower belly, a warm shower, water + a snack, a 10-minute break, stretching like child's pose, getting into comfy clothes, an earlier night, studying in short chunks). for pain relievers only say "if ibuprofen usually works for you, now's a good time" and never give doses.
- end with ONE gentle, specific question that keeps the conversation going (not "how's your day").
- if she's venting or irritated, let her vent. match her energy a little, be on her side, a tiny bit of humor is ok if she's joking. don't lecture.
- if she mentions an exam, assignment, or deadline, acknowledge the pressure and help her plan around her period (pack pads in her bag, plan an easy evening, short study blocks). if her next period is due within 5 days, mention the date.
- remember what she said earlier in this conversation and refer back to it.
- never end the conversation yourself. if she says bye/thanks, say a warm short goodbye.
- never tell her to log a pad unless she mentions changing or using one; then ask if she wants to log it in pad check.
- never say "abnormal" or "diagnosis". never guess what condition she has.
- if she mentions dizziness, fainting, soaking a pad every hour, severe pain, or possibly being pregnant, gently tell her this is worth getting checked today.
- if she sounds hopeless or mentions hurting herself, respond with care, tell her she deserves support right now, and encourage her to reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or UMD's Counseling Center, or someone she trusts. set crisis to true.
- the context may say how many pads she logged today. if it's a heavy day (several fully soaked pads, or clots), you can gently acknowledge it ("4 pads already today is a heavy day, be gentle with yourself"). never count or log pads for her, and never say it means anything medical.
- only fill energy, discomfort and mood when what she said shows them; otherwise null.

Examples:
user: ugh cramps all morning, skipped the gym, slept like 5 hrs
nari: 5 hours of sleep plus cramps is a rough way to start a day. skipping the gym was the right call, your body's already doing a lot.\\n\\ncould you get a heat pad or a hot shower in before tonight? and is there anything you actually have to get done today, or can you go easy?

user: i have a chem exam tomorrow and i literally cannot focus, everything hurts
nari: cramps the night before a chem exam is genuinely unfair. no wonder you can't focus.\\n\\ntry heat on your lower belly, water nearby, and 25 minute study chunks with 5 minute breaks lying down. pack pads + a snack in your bag tonight so tomorrow-you doesn't have to think about it. what topic is stressing you most?

user: my roommate keeps being loud at 2am and i'm already so irritated
nari: being on your period AND sleep-deprived because of someone else is a whole new level of annoying. you're allowed to be irritated about that.\\n\\ndo you want to vent about it, or think through what you could say to her?

user: thanks nari, i'm gonna sleep
nari: good call. hope the cramps ease up overnight. sleep well 🤍`;

const clampRating = (v: unknown): Rating | null =>
  typeof v === "number" && v >= 1 && v <= 5 ? (Math.round(v) as Rating) : null;

export async function chatTurn(text: string, ctx: ChatContext): Promise<ChatTurn | null> {
  const where = ctx.periodDay
    ? `she is on day ${ctx.periodDay} of her period.`
    : "she is not on her period right now.";
  const next =
    ctx.nextPeriod && ctx.daysUntilNext !== null
      ? ` her next period is expected ${ctx.nextPeriod} (in ${ctx.daysUntilNext} days).`
      : "";
  const pads = ctx.padsToday ? ` ${ctx.padsToday}.` : "";
  // real multi-turn history so nari can follow the conversation
  const contents = [
    ...ctx.history
      .filter((m) => m.body.trim())
      .map((m) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.body.slice(0, 600) }] })),
    { role: "user", parts: [{ text: `[context: today is ${ctx.today}. ${where}${next}${pads}]\n${text.slice(0, 1000)}` }] },
  ];
  // Gemini wants the conversation to start with a user turn
  while (contents.length > 1 && contents[0].role !== "user") contents.shift();

  const r = await askJson(contents, TURN_SCHEMA, { system: NARI_SYSTEM, label: "chat" });
  if (!r.ok) return null;
  const out = r.data as Partial<ChatTurn>;
  return {
    reply: typeof out.reply === "string" ? out.reply.trim().slice(0, 700) : "",
    energy: clampRating(out.energy),
    discomfort: clampRating(out.discomfort),
    mood: clampRating(out.mood),
    activities: Array.isArray(out.activities)
      ? out.activities.filter((a) => typeof a === "string").map((a) => a.toLowerCase().slice(0, 30)).slice(0, 4)
      : [],
    mentionsPadChange: out.mentionsPadChange === true,
    mentionsDeadline: out.mentionsDeadline === true,
    crisis: out.crisis === true,
  };
}

// ---------- pad photo ----------

const PAD_SCHEMA = {
  type: "object",
  properties: {
    isPad: { type: "boolean", description: "true if the photo shows a menstrual pad (used or test-stained)" },
    soak: {
      type: ["string", "null"],
      enum: ["light", "moderate", "full", null],
      description:
        "judge by how much of the pad's absorbent core is stained. light = a few spots, under about a quarter of the core. moderate = roughly a quarter to two thirds of the core. full = most of the core (about two thirds or more), or the stain reaches the core's edges or ends. when torn between moderate and full, pick full.",
    },
    clot: {
      type: ["string", "null"],
      enum: ["none", "small", "large", null],
      description:
        "size clots against the pad: a typical pad core is about 6-7 cm wide, and a US quarter is 2.4 cm, about a third of the pad's width. large = any clot about that size or bigger. small = visible clots smaller than that. none = no distinct clumps.",
    },
    color: {
      type: ["string", "null"],
      enum: ["pink", "bright-red", "dark-red", "brown-black", "orange-gray", "unsure", null],
      description: "the general color of the blood on the pad. use 'unsure' if lighting makes it hard to tell",
    },
  },
  required: ["isPad", "soak", "clot", "color"],
};

export type PadPhotoResult =
  | { ok: true; soak: Soak | null; clot: Clot | null; color: PadColor | null; model: string | null }
  | { ok: false; reason: PadFailReason };

export async function guessPadFromImage(base64: string, mimeType: string): Promise<PadPhotoResult> {
  const r = await askJson(
    [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          {
            text: "This is a photo a user took of her own menstrual pad to score it with the PBAC chart (Higham 1990), a standard clinical tool doctors use to measure menstrual blood loss. Estimate how soaked the pad is and whether there are clots, using the definitions in the schema. People tend to under-report heavy bleeding, so do not round a heavily stained pad down. Also give the general color of the blood, only as one of the listed categories. Lighting and cameras distort color, so say 'unsure' rather than guess. Never comment on what the color means. This is only a suggestion; she confirms it herself.",
          },
        ],
      },
    ],
    PAD_SCHEMA,
    { timeoutMs: IMAGE_TIMEOUT_MS, label: "pad" },
  );
  if (!r.ok) return { ok: false, reason: r.reason ?? "error" };
  const out = r.data as { isPad?: boolean; soak?: Soak | null; clot?: Clot | null; color?: PadColor | null };
  if (out.isPad === false) {
    console.warn("[gemini:pad] model said this is not a pad");
    return { ok: false, reason: "not-a-pad" };
  }
  const soaks: Soak[] = ["light", "moderate", "full"];
  const clots: Clot[] = ["none", "small", "large"];
  const colors: PadColor[] = ["pink", "bright-red", "dark-red", "brown-black", "orange-gray", "unsure"];
  return {
    ok: true,
    soak: out.soak && soaks.includes(out.soak) ? out.soak : null,
    clot: out.clot && clots.includes(out.clot) ? out.clot : null,
    color: out.color && colors.includes(out.color) ? out.color : null,
    model: r.model,
  };
}
