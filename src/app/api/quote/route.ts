import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Stores a print-quote submission (Phase 4 — feeds the admin quotes inbox).
 * Inserts with the ANON key: the RLS anon-insert policy on print_quotes is
 * the thing being exercised. Same rate-limit approach as /api/notify.
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
  if (hits.size > 5000) hits.clear();
  return false;
}

const BINDINGS = new Set(["none", "spiral", "book"]);

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0, 25) : "";
  const description =
    typeof body?.description === "string" ? body.description.trim().slice(0, 1000) : "";
  const binding =
    typeof body?.binding === "string" && BINDINGS.has(body.binding) ? body.binding : null;

  if (!name || !phone || !description) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { error } = await supabaseServer()
    .from("print_quotes")
    .insert({ name, phone, description, binding });

  if (error) {
    console.error("[quote] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
