import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

/** The current user's store. Fake memory data until Supabase env vars exist. */
export async function getStore(): Promise<Store> {
  if (!isSupabaseConfigured) return memoryStore;
  const db = await createClient();
  const { data } = await db.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  return supabaseStore(db, userId);
}
