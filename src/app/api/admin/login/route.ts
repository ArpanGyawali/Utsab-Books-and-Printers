import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin/auth";

/**
 * Sends the admin magic-link email. The allowed email is checked HERE, server
 * side, before any OTP goes out — so this endpoint cannot be used to spam
 * OTP emails to arbitrary addresses or to create users (shouldCreateUser is
 * false; the admin auth user is pre-created by `npm run db:seed-admin`).
 *
 * The response is identical whether or not the email matched, so it does not
 * confirm which address is the admin's.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (isAdminEmail(email)) {
    // Plain anon client — no cookies involved in sending the link.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${request.nextUrl.origin}/admin/auth/callback`,
      },
    });
    if (error) {
      // Log for the operator; still answer generically below.
      console.error("[admin/login] signInWithOtp failed:", error.message);
    }
  }

  return NextResponse.json({ ok: true });
}
