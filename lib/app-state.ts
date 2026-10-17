import "server-only";

import { connection } from "next/server";
import { getAppDate } from "./date";
import { derive, type Derived, type RawState } from "./derive";
import { getStore } from "./store";
import type { Store } from "./store/types";

// UMD University Health Center (verified on health.umd.edu/about-us/appointments)
export const UMD_BOOKING_URL = "https://www.myuhc.umd.edu/";
export const UMD_PHONE = "301.314.8184";

export interface Loaded {
  store: Store;
  raw: RawState;
  d: Derived;
}

/** Load the current user's rows and derive everything for today's app date. */
export async function loadAll(): Promise<Loaded> {
  await connection(); // always render per request (dates + per-user data)
  const store = await getStore();
  const raw = await store.load();
  const d = derive(raw, getAppDate(raw.profile.dayOffset));
  return { store, raw, d };
}

export const isISODate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
