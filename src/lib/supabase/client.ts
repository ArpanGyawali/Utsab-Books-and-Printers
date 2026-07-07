"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser client (anon key, RLS applies). Public pages avoid client-side
 * fetching per SKILL.md — this exists for the few interactive islands that
 * need it and for the Phase 4 admin login.
 */

let cached: SupabaseClient<Database> | null = null;

export function supabaseBrowser(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return cached;
}
