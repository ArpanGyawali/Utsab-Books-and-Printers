import type { BookStatus } from "@/lib/supabase/types";

/**
 * Parsing + validation for the admin book form (create and edit share it).
 * Returns clean column values or a human-readable error.
 */

const STATUSES = new Set<BookStatus>(["in_stock", "out_of_stock", "arriving"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ०-९ → 0-9 — the owner may type Devanagari numerals on his phone. */
function toAsciiDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
}

const str = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

export type BookColumns = {
  school_id: string;
  class_id: number;
  subject: string;
  title_en: string;
  title_ne: string | null;
  publisher: string | null;
  price: number | null;
  status: BookStatus;
  units: number;
  expected_arrival: string | null;
};

export function parseBookForm(
  fd: FormData
): { ok: true; data: BookColumns } | { ok: false; error: string } {
  const school_id = str(fd, "school_id");
  if (!UUID_RE.test(school_id)) return { ok: false, error: "Pick a school." };

  const class_id = Number.parseInt(toAsciiDigits(str(fd, "class_id")), 10);
  if (!Number.isInteger(class_id)) return { ok: false, error: "Pick a class." };

  const subject = str(fd, "subject");
  if (!subject) return { ok: false, error: "Subject is required." };

  const title_en = str(fd, "title_en");
  if (!title_en) return { ok: false, error: "English title is required." };

  const rawPrice = toAsciiDigits(str(fd, "price"));
  const price = rawPrice === "" ? null : Number(rawPrice);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: `"${rawPrice}" is not a valid price. Leave empty for "Ask".` };
  }

  const status = str(fd, "status") as BookStatus;
  if (!STATUSES.has(status)) return { ok: false, error: "Pick a status." };

  const rawUnits = toAsciiDigits(str(fd, "units"));
  const units = rawUnits === "" ? 0 : Number.parseInt(rawUnits, 10);
  if (!Number.isInteger(units) || units < 0) {
    return { ok: false, error: `"${rawUnits}" is not a valid number of copies.` };
  }

  const arrival = str(fd, "expected_arrival");
  if (arrival && !/^\d{4}-\d{2}-\d{2}$/.test(arrival)) {
    return { ok: false, error: "Expected arrival must be a date." };
  }

  return {
    ok: true,
    data: {
      school_id,
      class_id,
      subject,
      title_en,
      title_ne: str(fd, "title_ne") || null,
      publisher: str(fd, "publisher") || null,
      price,
      status,
      units,
      expected_arrival: status === "arriving" && arrival ? arrival : null,
    },
  };
}

/** Cover uploads: type allowlist + size cap, checked server-side. */
export const COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const COVER_MAX_BYTES = 5 * 1024 * 1024;
