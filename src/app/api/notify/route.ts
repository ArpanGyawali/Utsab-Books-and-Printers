import { NextResponse, type NextRequest } from "next/server";
import { normalizeNepaliMobile } from "@/lib/phone";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Notify-me signups (out-of-stock books). Inserts into `inquiries` with the
 * ANON key — RLS must allow it; that's the policy being exercised here.
 * Rate-limited per IP; in-memory is fine for one Vercel instance and fails
 * open, which is acceptable for a low-stakes waiting list.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Bound the map so a scan can't grow memory forever.
  if (hits.size > 5000) hits.clear();
  return false;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const bookId = typeof body?.bookId === "string" ? body.bookId : "";
  const phone = normalizeNepaliMobile(typeof body?.phone === "string" ? body.phone : "");

  if (!UUID_RE.test(bookId) || !phone) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { error } = await supabaseServer()
    .from("inquiries")
    .insert({ book_id: bookId, phone });

  if (error) {
    console.error("[notify] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
