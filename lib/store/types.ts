import type { RawDayLog, RawState } from "../derive";
import type { ChatCard, ChatMessage, ISODate, PadLog, Profile } from "../types";

/**
 * Where Nari's rows live. Two implementations with the same shape:
 * - memory.ts: fake in-memory data (M0, works with no database)
 * - supabase.ts: the real database (M1+), one user per login
 * Actions only talk to this interface, so swapping is invisible to the UI.
 */
export interface Store {
  load(): Promise<RawState>;
  updateProfile(patch: Partial<Omit<Profile, "id">>): Promise<void>;
  upsertDay(log: RawDayLog): Promise<void>;
  addPad(pad: PadLog): Promise<void>;
  /** Adds messages. Scheduled kinds are unique per (appDate, kind); duplicates are ignored. */
  addMessages(msgs: ChatMessage[]): Promise<void>;
  updateMessageCard(id: string, card: ChatCard): Promise<void>;
  /** Replace everything with this state (load demo data). */
  replaceAll(state: Omit<RawState, "profile">, profile: Partial<Omit<Profile, "id">>): Promise<void>;
  /** Delete all of this user's rows (delete my data). */
  clearAll(): Promise<void>;
}

export const SCHEDULED_KINDS = new Set(["checkin", "heads-up", "did-it-come"]);

export type { ISODate };
