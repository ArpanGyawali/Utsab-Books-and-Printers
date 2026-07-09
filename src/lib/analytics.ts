import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Server-side event log (public.events, migration 0009) — feeds the owner's
 * monthly report: what people searched, which books they inquired about.
 * Fire-and-forget: analytics must never break or slow a page, so callers
 * wrap it in after() or just don't await, and every failure is swallowed.
 */

export type EventType = "search" | "inquire_click" | "notify_submit" | "quote_submit";

export async function logEvent(
  type: EventType,
  data: Record<string, string | number | null>,
  locale?: string
): Promise<void> {
  try {
    const { error } = await supabaseAdmin()
      .from("events")
      .insert({ type, data, locale: locale ?? null });
    if (error) console.error("[analytics] insert failed:", error.message);
  } catch (err) {
    console.error("[analytics] logEvent threw:", err);
  }
}
