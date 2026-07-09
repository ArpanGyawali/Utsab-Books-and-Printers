import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Keep-alive for the Supabase free tier (pauses after ~7 idle days).
 * Hit daily by the Vercel cron in vercel.json; the read itself is the point.
 */
export async function GET() {
  const { error } = await supabaseServer()
    .from("classes")
    .select("id")
    .limit(1);

  if (error) {
    console.error("[ping] supabase read failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
