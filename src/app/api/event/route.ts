import { NextResponse, type NextRequest } from "next/server";
import { logEvent } from "@/lib/analytics";

/**
 * Client-side analytics beacon — currently only WhatsApp inquire clicks;
 * everything else is logged server-side where it happens. Same in-memory
 * per-IP rate limiting as /api/notify (fails open, fine for analytics).
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 60;
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

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max) : null;

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (body?.type !== "inquire_click") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Whitelist the payload — never store arbitrary client JSON.
  await logEvent(
    "inquire_click",
    {
      title: str(body.title, 120),
      class: str(body.class, 60),
      source: str(body.source, 20),
    },
    str(body.locale, 5) ?? undefined
  );
  return NextResponse.json({ ok: true });
}
