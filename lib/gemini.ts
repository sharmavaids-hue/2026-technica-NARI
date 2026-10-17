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

async function askJson(contents: unknown, schema: object): Promise<unknown | null> {
  const g = ai();
  if (!g) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await g.models.generateContent({
      model: MODEL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        abortSignal: controller.signal,
        temperature: 0.2,
      },
    });
    return res.text ? JSON.parse(res.text) : null;
  } catch (err) {
    console.warn("[gemini] failed, using manual fallback:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
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
