import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookie-aware server client for the admin panel (RSC, server actions, route
 * handlers). Carries the logged-in admin's session, so every query runs under
 * RLS with the `is_admin()` policies — the database enforces authorization
 * even if an application check is missed.
 *
 * Public pages keep using the plain anon client in server.ts; this one is
 * admin-only on purpose (it opts the route into dynamic rendering via
 * `cookies()`).
 */
export async function supabaseSession(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from an RSC, where Next.js forbids cookie writes. Safe to
          // ignore: proxy.ts refreshes sessions before requests reach here.
        }
      },
    },
  });
}
