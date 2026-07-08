"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookie-storing browser client for the admin login flow only. Sessions land
 * in cookies (not localStorage) so the server sees them on the next request.
 * Public interactive islands keep using client.ts (no session persistence).
 */

let cached: SupabaseClient<Database> | null = null;

export function supabaseBrowserAuth(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // The magic-link callback sets the session explicitly from the URL
    // fragment; automatic detection stays off so the flow is deterministic.
    { auth: { detectSessionInUrl: false } }
  );
  return cached;
}
