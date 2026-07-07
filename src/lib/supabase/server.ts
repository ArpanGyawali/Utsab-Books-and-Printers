import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Anon-key client for RSC and route handlers — public reads and the two
 * anon-insert tables (inquiries, print_quotes). RLS applies.
 *
 * No auth/session handling here on purpose; Phase 4 (admin) adds a separate
 * cookie-aware client via @supabase/ssr.
 */

let cached: SupabaseClient<Database> | null = null;

export function supabaseServer(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env.local and fill it in."
    );
  }

  cached = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
