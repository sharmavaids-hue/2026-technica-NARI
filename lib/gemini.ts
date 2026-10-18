import "server-only";

// Gemini helpers. Server only (the key never reaches the browser).
// Every call has a timeout and returns null on any failure, so the
// manual fallback always works and the demo never depends on Gemini.

import { GoogleGenAI } from "@google/genai";
import type { Clot, Rating, Soak } from "./types";

const TEXT_TIMEOUT_MS = 10_000;
const IMAGE_TIMEOUT_MS = 15_000; // photo guesses take ~8-9s on gemini-3.8-flash
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

let client: GoogleGenAI | null = null;
function ai(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

const FALLBACK_MODEL = "gemini-flash-latest";
let activeModel = MODEL; // switches to the fallback if GEMINI_MODEL isn't a real model ID
let lastError: string | null = null;
let lastModelUsed = MODEL;

async function askJson(contents: unknown, schema: object, timeoutMs = TEXT_TIMEOUT_MS, system?: string): Promise<unknown | null> {
  const g = ai();
  if (!g) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const call = (model: string) =>
    g.models.generateContent({
      model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: {
        ...(system ? { systemInstruction: system } : {}),
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        abortSignal: controller.signal,
        temperature: 0.4,
      },
    });
  try {
    let res;
    try {
      lastModelUsed = activeModel;
      res = await call(activeModel);
    } catch (err) {
      const msg = (err as Error).message ?? "";
      const badModel = /not.?found|404|is not supported|unknown model|invalid model/i.test(msg);
      const busy = /503|UNAVAILABLE|high demand|overloaded|429|RESOURCE_EXHAUSTED/i.test(msg);
      if ((!badModel && !busy) || activeModel === FALLBACK_MODEL) throw err;
      console.warn(`[gemini] "${activeModel}" ${badModel ? "not available" : "busy"}, trying ${FALLBACK_MODEL}`);
      if (badModel) activeModel = FALLBACK_MODEL; // permanent switch only for a wrong ID
      res = await call(FALLBACK_MODEL);
      lastModelUsed = FALLBACK_MODEL;
    }
    lastError = null;
    return res.text ? JSON.parse(res.text) : null;
  } catch (err) {
    const e = err as Error;
    lastError = e.name === "AbortError" ? `timed out after ${timeoutMs / 1000}s` : (e.message ?? String(err)).slice(0, 500);
    console.warn("[gemini] failed, using manual fallback:", lastError);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** For scripts/check-gemini: which model actually answered. */
export async function geminiSelfTest(): Promise<{ ok: boolean; model: string; sample: unknown; error: string | null }> {
  const out = await askJson("Reply with {\"hi\": \"there\"}", {
    type: "object",
    properties: { hi: { type: "string" } },
    required: ["hi"],
  });
  return { ok: out !== null, model: lastModelUsed, sample: out, error: out === null ? lastError ?? "no GEMINI_API_KEY" : null };
}

// ---------- chat turn (reply + check-in numbers) ----------

export interface ChatTurn {
  reply: string;
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
  mentionsPadChange: boolean;
  crisis: boolean;
}

export interface ChatContext {
  today: string;
  periodDay: number | null;
  nextPeriod: string | null; // "nov 13"
  daysUntilNext: number | null;
  recent: string[]; // last few messages, "nari: ..." / "user: ..."
}

const rating = { type: ["integer", "null"], minimum: 1, maximum: 5 };

const TURN_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "nari's reply, lowercase, 1-3 short sentences" },
    energy: { ...rating, description: "1 = exhausted, 5 = full of energy. null if not mentioned or implied" },
    discomfort: { ...rating, description: "1 = no pain/cramps, 5 = severe. null if not mentioned or implied" },
    mood: { ...rating, description: "1 = very low, 5 = great. null if not mentioned or implied" },
    activities: {
      type: "array",
      items: { type: "string" },
      description: "2-4 word lowercase chips of what she did today, e.g. 'skipped the gym', 'studied', 'slept 5 hrs'. max 4. empty if none",
    },
    mentionsPadChange: { type: "boolean", description: "true if she mentions changing, soaking or checking a pad/tampon" },
    crisis: { type: "boolean", description: "true if she sounds hopeless, unsafe, or mentions self-harm" },
  },
  required: ["reply", "energy", "discomfort", "mood", "activities", "mentionsPadChange", "crisis"],
};

const NARI_SYSTEM = `you are nari, a warm friend who checks in on college women during their period. reply in lowercase, 1-3 short sentences, specific to what she said: name the actual thing (the exam, the cramps, the 5 hours of sleep), offer one small comfort (a heat pad, water, a snack, a short break, an easy night), and ask one gentle follow-up when it fits. sound like a friend texting, not a doctor or a brochure. never say goodbye or "see you tomorrow" unless she does. never diagnose, never say "abnormal" or "diagnosis", never suggest medicines or doses. don't end every reply by asking her to log a pad; only mention pad check if she talks about changing or soaking pads. if she mentions an exam, assignment or deadline and her next period is due within 5 days, mention the date so she can plan (pack pads, plan an easy day). if she sounds hopeless, unsafe or in crisis, set crisis to true and keep the reply gentle. only fill energy, discomfort and mood when what she said shows them; otherwise null.`;

const clampRating = (v: unknown): Rating | null =>
  typeof v === "number" && v >= 1 && v <= 5 ? (Math.round(v) as Rating) : null;

export async function chatTurn(text: string, ctx: ChatContext): Promise<ChatTurn | null> {
  const where = ctx.periodDay
    ? `she is on day ${ctx.periodDay} of her period.`
    : "she is not on her period right now.";
  const next = ctx.nextPeriod && ctx.daysUntilNext !== null ? ` next period expected ${ctx.nextPeriod} (in ${ctx.daysUntilNext} days).` : "";
  const prompt = `today is ${ctx.today}. ${where}${next}
recent chat:
${ctx.recent.join("\n").slice(-1500)}

her new message: """${text.slice(0, 1000)}"""`;
  const out = (await askJson(prompt, TURN_SCHEMA, TEXT_TIMEOUT_MS, NARI_SYSTEM)) as Partial<ChatTurn> | null;
  if (!out) return null;
  return {
    reply: typeof out.reply === "string" ? out.reply.trim().toLowerCase().slice(0, 400) : "",
    energy: clampRating(out.energy),
    discomfort: clampRating(out.discomfort),
    mood: clampRating(out.mood),
    activities: Array.isArray(out.activities)
      ? out.activities.filter((a) => typeof a === "string").map((a) => a.toLowerCase().slice(0, 30)).slice(0, 4)
      : [],
    mentionsPadChange: out.mentionsPadChange === true,
    crisis: out.crisis === true,
  };
}

// ---------- pad photo ----------

const PAD_SCHEMA = {
  type: "object",
  properties: {
    isPad: { type: "boolean", description: "true only if the photo shows a used menstrual pad" },
    soak: {
      type: ["string", "null"],
      enum: ["light", "moderate", "full", null],
      description: "light = a few spots/lightly stained, moderate = about half soaked, full = soaked through",
    },
    clot: {
      type: ["string", "null"],
      enum: ["none", "small", "large", null],
      description: "large = about the size of a US quarter (24mm) or bigger",
    },
  },
  required: ["isPad", "soak", "clot"],
};

export async function guessPadFromImage(
  base64: string,
  mimeType: string,
): Promise<{ soak: Soak | null; clot: Clot | null } | null> {
  const out = (await askJson(
    [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          {
            text: "This is a photo a user took of her own used menstrual pad to score it with the PBAC chart (Higham 1990), a standard clinical tool. Estimate how soaked the pad is and whether there are clots. This is only a suggestion; she confirms it herself.",
          },
        ],
      },
    ],
    PAD_SCHEMA,
    IMAGE_TIMEOUT_MS,
  )) as { isPad?: boolean; soak?: Soak | null; clot?: Clot | null } | null;
  if (!out || out.isPad === false) return null;
  const soaks: Soak[] = ["light", "moderate", "full"];
  const clots: Clot[] = ["none", "small", "large"];
  return {
    soak: out.soak && soaks.includes(out.soak) ? out.soak : null,
    clot: out.clot && clots.includes(out.clot) ? out.clot : null,
  };
}
