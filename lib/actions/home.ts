"use server";

import { revalidatePath } from "next/cache";
import { isISODate, loadAll } from "../app-state";
import { toHome, type RawDayLog } from "../derive";
import type { ActionResult, DayInput, HomeData, ISODate, Rating } from "../types";

const asRating = (v: unknown): Rating | null =>
  typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5 ? (v as Rating) : null;

/** Everything the Home tab needs. */
export async function getHome(): Promise<HomeData> {
  const { raw, d } = await loadAll();
  return toHome(raw, d);
}

/** Save the bars/activities for one day ("edit this day"). */
export async function saveDay(input: DayInput): Promise<ActionResult> {
  if (!isISODate(input.date)) return { ok: false, error: "bad date" };
  const { store, raw, d } = await loadAll();
  const existing = raw.dayLogs.find((l) => l.date === input.date);
  const inCurrentPeriod = Boolean(d.current && input.date >= d.current.start && input.date <= d.today);
  const log: RawDayLog = {
    date: input.date,
    isPeriod: existing?.isPeriod ?? inCurrentPeriod,
    energy: asRating(input.energy),
    discomfort: asRating(input.discomfort),
    mood: asRating(input.mood),
    activities: (input.activities ?? []).map((a) => String(a).trim().toLowerCase()).filter(Boolean).slice(0, 8),
  };
  await store.upsertDay(log);
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** "edit period days" mode: tap a day on or off. */
export async function setPeriodDay(date: ISODate, isPeriod: boolean): Promise<ActionResult> {
  if (!isISODate(date)) return { ok: false, error: "bad date" };
  const { store, raw, d } = await loadAll();
  if (date > d.today) return { ok: false, error: "you can't log a future day" };
  if (!isPeriod && raw.padLogs.some((p) => p.date === date)) {
    return { ok: false, error: "this day has pads logged, so it stays a period day" };
  }
  const existing = raw.dayLogs.find((l) => l.date === date);
  await store.upsertDay({
    date,
    isPeriod,
    energy: existing?.energy ?? null,
    discomfort: existing?.discomfort ?? null,
    mood: existing?.mood ?? null,
    activities: existing?.activities ?? [],
  });
  revalidatePath("/app", "layout");
  return { ok: true };
}
