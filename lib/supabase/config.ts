// Supabase env vars. The publishable key (sb_publishable_...) or the legacy
// anon key both work; they are safe in the browser because RLS protects rows.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** false = no Supabase yet: the app runs on fake in-memory demo data. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
