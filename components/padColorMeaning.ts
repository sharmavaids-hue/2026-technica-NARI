// What a pad color usually means. Written by us from Cleveland Clinic guidance, never by AI.
// Say "usually"; never "abnormal" or "diagnosis".

import type { PadColor } from "@/lib/types";

export const PAD_COLORS: PadColor[] = ["pink", "bright-red", "dark-red", "brown-black", "orange-gray", "unsure"];

/** The word shown on every option and record row (never color alone). */
export const COLOR_WORDS: Record<PadColor, string> = {
  pink: "pink",
  "bright-red": "bright red",
  "dark-red": "dark red",
  "brown-black": "brown / black",
  "orange-gray": "orange / gray",
  unsure: "not sure",
};

/** Flat swatch fills. Two-tone options get two halves. Purely decorative next to the word. */
export const COLOR_SWATCH: Record<PadColor, [string, string] | null> = {
  pink: ["#e9a3ad", "#e9a3ad"],
  "bright-red": ["#c8242f", "#c8242f"],
  "dark-red": ["#7a1a24", "#7a1a24"],
  "brown-black": ["#6b3a26", "#2a1a16"],
  "orange-gray": ["#d98a4a", "#9a9590"],
  unsure: null,
};

export const COLOR_MEANING: Record<PadColor, { usually: string; ask?: string }> = {
  pink: { usually: "pink usually means fresh blood mixed with discharge. common at the very start or end of a period." },
  "bright-red": { usually: "bright red is usually fresh blood flowing steadily. very common on heavier days." },
  "dark-red": {
    usually: "dark red is usually blood that took a little longer to leave the body. common in the mornings and later days.",
  },
  "brown-black": {
    usually: "brown or black is usually older blood that's had time to oxidize. very common at the start or end of a period.",
    ask: "worth asking a doctor if it lasts weeks or comes with a strong smell.",
  },
  "orange-gray": {
    usually: "orange or gray can sometimes come from blood mixed with other discharge.",
    ask: "worth asking a doctor soon if there's a strong smell, itching, or fever. it can be a sign of an infection that's easy to treat.",
  },
  unsure: { usually: "lighting can make color hard to tell. that's okay, your soak and clots still count." },
};

export const LARGE_CLOT_ASK = "worth asking a doctor if you often pass clots a quarter-size or bigger.";
export const MEANING_SOURCE = "based on Cleveland Clinic guidance. nari doesn't diagnose.";
