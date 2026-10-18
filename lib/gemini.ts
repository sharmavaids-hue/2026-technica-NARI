import "server-only";

// Gemini helpers. Server only (the key never reaches the browser).
// Every call has a timeout and returns null on any failure, so the
// manual fallback always works and the demo never depends on Gemini.

import { GoogleGenAI } from "@google/genai";
import type { Clot, Rating, Soak } from "./types";

const TIMEOUT_MS = 8000;
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

async function askJson(contents: unknown, schema: object): Promise<unknown | null> {
  const g = ai();
  if (!g) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const call = (model: string) =>
    g.models.generateContent({
      model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        abortSignal: controller.signal,
        temperature: 0.2,
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
    lastError = e.name === "AbortError" ? `timed out after ${TIMEOUT_MS / 1000}s` : (e.message ?? String(err)).slice(0, 500);
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

// ---------- check-in parsing ----------

export interface CheckinParse {
  energy: Rating | null;
  discomfort: Rating | null;
  mood: Rating | null;
  activities: string[];
  reply: string;
}

const rating = { type: ["integer", "null"], minimum: 1, maximum: 5 };

const CHECKIN_SCHEMA = {
  type: "object",
  properties: {
    energy: { ...rating, description: "1 = exhausted, 5 = full of energy. null if not mentioned or implied." },
    discomfort: { ...rating, description: "1 = no pain/cramps, 5 = severe. null if not mentioned or implied." },
    mood: { ...rating, description: "1 = very low, 5 = great. null if not mentioned or implied." },
    activities: {
      type: "array",
      items: { type: "string" },
      description: "2-4 word lowercase chips, e.g. 'skipped the gym', 'studied', 'slept 5 hrs'. Max 4.",
    },
    reply: {
      type: "string",
      description:
        "one short warm reply from nari, lowercase, like a friend texting, max 20 words. no medical advice, never say abnormal or diagnosis. may end by asking if she wants to log a pad.",
    },
  },
  required: ["energy", "discomfort", "mood", "activities", "reply"],
};

const clampRating = (v: unknown): Rating | null =>
  typeof v === "number" && v >= 1 && v <= 5 ? (Math.round(v) as Rating) : null;

export async function parseCheckin(text: string, periodDay: number | null): Promise<CheckinParse | null> {
  const prompt = `You turn a college student's casual period check-in text into numbers.
She is on day ${periodDay ?? "?"} of her period. Nari asked: "how's your energy, and what did you get up to today?"
Her reply: """${text.slice(0, 1000)}"""`;
  const out = (await askJson(prompt, CHECKIN_SCHEMA)) as Partial<CheckinParse> | null;
  if (!out) return null;
  return {
    energy: clampRating(out.energy),
    discomfort: clampRating(out.discomfort),
    mood: clampRating(out.mood),
    activities: Array.isArray(out.activities)
      ? out.activities.filter((a) => typeof a === "string").map((a) => a.toLowerCase().slice(0, 30)).slice(0, 4)
      : [],
    reply: typeof out.reply === "string" && out.reply.trim() ? out.reply.trim().toLowerCase() : "",
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
  )) as { isPad?: boolean; soak?: Soak | null; clot?: Clot | null } | null;
  if (!out || out.isPad === false) return null;
  const soaks: Soak[] = ["light", "moderate", "full"];
  const clots: Clot[] = ["none", "small", "large"];
  return {
    soak: out.soak && soaks.includes(out.soak) ? out.soak : null,
    clot: out.clot && clots.includes(out.clot) ? out.clot : null,
  };
}
