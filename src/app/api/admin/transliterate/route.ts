import { requireAdmin } from "@/lib/admin/auth";

/**
 * Roman → Devanagari suggestions for the admin Nepali fields, proxied through
 * our own origin (so the browser makes a same-origin request — no CORS — and
 * the call stays admin-only). Backed by Google Input Tools; on any failure we
 * return an empty list so the field silently falls back to plain typing.
 */
export async function GET(req: Request) {
  await requireAdmin();

  const text = (new URL(req.url).searchParams.get("text") ?? "").slice(0, 40);
  // Only Latin words are transliterated; anything else has no suggestions.
  if (!/^[a-zA-Z]+$/.test(text)) return Response.json({ candidates: [] });

  try {
    const url =
      "https://inputtools.google.com/request?" +
      new URLSearchParams({
        text,
        itc: "ne-t-i0-und",
        num: "6",
        cp: "0",
        cs: "1",
        ie: "utf-8",
        oe: "utf-8",
      });
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    // Shape: ["SUCCESS", [[ "namaste", ["नमस्ते", …], …]]]
    const candidates: string[] =
      Array.isArray(data) && data[0] === "SUCCESS" ? data[1][0][1] : [];
    return Response.json({ candidates });
  } catch {
    return Response.json({ candidates: [] });
  }
}
