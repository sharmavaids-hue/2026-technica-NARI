"use server";

import { revalidatePath } from "next/cache";
import { isISODate, loadAll } from "../app-state";
import { derive } from "../derive";
import { guessPadFromImage } from "../gemini";
import { padPoints, scoreOf } from "../pbac";
import type { Clot, PadCheckData, PadGuess, PadInput, PadLog, SavePadResult, Soak } from "../types";

const SOAKS: Soak[] = ["light", "moderate", "full"];
const CLOTS: Clot[] = ["none", "small", "large"];

export async function getPadCheck(): Promise<PadCheckData> {
  const { d } = await loadAll();
  return {
    today: d.today,
    score: scoreOf(d.scorePeriod?.score ?? 0),
    todayPads: d.dayMap.get(d.today)?.pads ?? [],
    signals: d.signals,
  };
}

/**
 * Ask Gemini for a soak/clot suggestion. formData field "photo" = the image,
 * resized in the browser first. The photo is never stored or logged.
 */
export async function guessPad(formData: FormData): Promise<PadGuess> {
  const file = formData.get("photo");
  if (!(file instanceof Blob) || file.size === 0 || file.size > 4_000_000) {
    return { soak: null, clot: null, ok: false };
  }
  const mime = file.type || "image/jpeg";
  if (!mime.startsWith("image/")) return { soak: null, clot: null, ok: false };
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const guess = await guessPadFromImage(base64, mime);
  if (!guess) return { soak: null, clot: null, ok: false };
  return { ...guess, ok: true };
}

export async function savePad(input: PadInput): Promise<SavePadResult> {
  if (!SOAKS.includes(input.soak) || !CLOTS.includes(input.clot)) throw new Error("bad pad");
  const { store, raw, d } = await loadAll();
  const date = input.date && isISODate(input.date) && input.date <= d.today ? input.date : d.today;
  const before = d.scorePeriod?.score ?? 0;

  const pad: PadLog = {
    id: crypto.randomUUID(),
    date,
    loggedAt: new Date().toISOString(),
    soak: input.soak,
    clot: input.clot,
    leaked: Boolean(input.leaked),
    points: padPoints({ soak: input.soak, clot: input.clot, leaked: Boolean(input.leaked) }),
    aiSoak: SOAKS.includes(input.aiSoak as Soak) ? input.aiSoak : null,
    aiClot: CLOTS.includes(input.aiClot as Clot) ? input.aiClot : null,
  };
  await store.addPad(pad);

  // saving a pad marks that day as a period day
  const existing = raw.dayLogs.find((l) => l.date === date);
  if (!existing?.isPeriod) {
    await store.upsertDay({
      date,
      isPeriod: true,
      energy: existing?.energy ?? null,
      discomfort: existing?.discomfort ?? null,
      mood: existing?.mood ?? null,
      activities: existing?.activities ?? [],
    });
  }
  if (!d.current && date === d.today) await store.updateProfile({ lastPeriodStart: date });

  const after = derive({ ...raw, padLogs: [...raw.padLogs, pad] }, d.today);
  revalidatePath("/app", "layout");
  const score = scoreOf(after.scorePeriod?.score ?? 0);
  return {
    pad,
    added: pad.points,
    // a pad that starts a new period starts the count-up from 0
    before: after.current && d.current && after.current.start === d.current.start ? before : 0,
    score,
    signals: after.signals,
  };
}
