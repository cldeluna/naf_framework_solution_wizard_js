import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional chaining keeps this importable under plain Node (tests/scripts),
// where import.meta.env does not exist.
const url = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when Supabase env vars are present. When false the app runs in
 * "JSON-only mode": the full wizard and file export work, but database
 * and sign-in features are hidden (SPEC §3.6).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** Supabase client, or null in JSON-only mode. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
