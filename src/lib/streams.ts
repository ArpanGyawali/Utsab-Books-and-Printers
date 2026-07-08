import type { Stream } from "./supabase/types";

/**
 * Class 11/12 streams. Kept free of server-only imports — the admin BookForm
 * (client) and the public books page (RSC) both use it.
 *
 * A book with stream = null is common to all streams; picking an individual
 * stream must therefore show that stream's books PLUS the common ones.
 */

export const STREAMS: readonly Stream[] = ["science", "management", "arts"];

/** Seeded class ids for Class 11 and 12 (0002_seed.sql). */
export const STREAM_CLASS_IDS: ReadonlySet<number> = new Set([14, 15]);

export function isStream(value: string): value is Stream {
  return (STREAMS as readonly string[]).includes(value);
}
