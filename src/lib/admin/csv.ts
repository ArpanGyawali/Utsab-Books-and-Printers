import Papa from "papaparse";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookStatus, Database } from "@/lib/supabase/types";

/**
 * CSV parsing/diffing for the admin import screen. Same template, class map,
 * and natural key as scripts/import-books.mjs (the Phase-3 CLI importer) —
 * keep the two in sync if the template ever changes.
 *
 * Template columns:
 *   class,subject,title_en,title_ne,publisher,price,status,units,expected_arrival
 */

const STATUSES = new Set<BookStatus>(["in_stock", "out_of_stock", "arriving"]);

/** Must match the seeded `classes` rows (0002_seed.sql). */
const CLASS_IDS: Record<string, number> = {
  nursery: 1,
  lkg: 2,
  ukg: 3,
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [String(i + 1), i + 4])
  ),
};
const CLASS_KEYS: Record<number, string> = Object.fromEntries(
  Object.entries(CLASS_IDS).map(([k, v]) => [v, k])
);

const toAsciiDigits = (s: string) =>
  s.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));

export type CsvBookRow = {
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

export function parseBooksCsv(
  csv: string,
  schoolId: string
): { rows: CsvBookRow[]; errors: string[] } {
  const errors: string[] = [];
  const { data: rawRows, errors: parseErrors } = Papa.parse<Record<string, string>>(
    csv.trim(),
    { header: true, skipEmptyLines: true, transform: (v) => v.trim() }
  );
  for (const e of parseErrors) errors.push(`row ${(e.row ?? 0) + 2}: ${e.message}`);

  const rows: CsvBookRow[] = [];
  rawRows.forEach((r, i) => {
    const line = i + 2; // 1-based + header row
    const classId = CLASS_IDS[toAsciiDigits(r.class ?? "").toLowerCase()];
    if (!classId) return errors.push(`line ${line}: unknown class "${r.class}"`);
    if (!r.subject) return errors.push(`line ${line}: subject is required`);
    if (!r.title_en) return errors.push(`line ${line}: title_en is required`);
    if (!STATUSES.has(r.status as BookStatus))
      return errors.push(`line ${line}: bad status "${r.status}"`);

    const price = r.price ? Number(toAsciiDigits(r.price)) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0))
      return errors.push(`line ${line}: bad price "${r.price}"`);

    const units = r.units ? Number.parseInt(toAsciiDigits(r.units), 10) : 0;
    if (!Number.isInteger(units) || units < 0)
      return errors.push(`line ${line}: bad units "${r.units}"`);

    const arrival = r.expected_arrival || null;
    if (arrival && !/^\d{4}-\d{2}-\d{2}$/.test(arrival))
      return errors.push(
        `line ${line}: expected_arrival must be YYYY-MM-DD, got "${arrival}"`
      );

    rows.push({
      school_id: schoolId,
      class_id: classId,
      subject: r.subject,
      title_en: r.title_en,
      title_ne: r.title_ne || null,
      publisher: r.publisher || null,
      price,
      status: r.status as BookStatus,
      units,
      expected_arrival: arrival,
    });
  });

  // Duplicate natural keys within the file would make the upsert ambiguous.
  const seen = new Set<string>();
  for (const row of rows) {
    const key = naturalKey(row);
    if (seen.has(key))
      errors.push(
        `duplicate row in CSV: class ${CLASS_KEYS[row.class_id]} / ${row.subject} / ${row.title_en}`
      );
    seen.add(key);
  }

  return { rows, errors };
}

function naturalKey(r: {
  class_id: number;
  subject: string;
  title_en: string;
}): string {
  return `${r.class_id}|${r.subject}|${r.title_en}`;
}

export type ImportPreview = {
  inserts: { class: string; subject: string; title_en: string }[];
  updates: { class: string; subject: string; title_en: string; changes: string[] }[];
  unchangedCount: number;
  /** Books in the DB (same school) that the CSV does not mention. */
  missingCount: number;
  errors: string[];
  totalRows: number;
};

const COMPARED = [
  "title_ne",
  "publisher",
  "price",
  "status",
  "units",
  "expected_arrival",
] as const;

export async function previewBooksImport(
  supabase: SupabaseClient<Database>,
  csv: string,
  schoolId: string
): Promise<ImportPreview> {
  const { rows, errors } = parseBooksCsv(csv, schoolId);
  const preview: ImportPreview = {
    inserts: [],
    updates: [],
    unchangedCount: 0,
    missingCount: 0,
    errors,
    totalRows: rows.length,
  };
  if (errors.length) return preview;

  const { data: existing, error } = await supabase
    .from("books")
    .select("class_id, subject, title_en, title_ne, publisher, price, status, units, expected_arrival")
    .eq("school_id", schoolId);
  if (error) {
    preview.errors.push(`could not read current books: ${error.message}`);
    return preview;
  }

  const byKey = new Map(existing.map((b) => [naturalKey(b), b]));
  const csvKeys = new Set(rows.map(naturalKey));
  preview.missingCount = existing.filter((b) => !csvKeys.has(naturalKey(b))).length;

  for (const row of rows) {
    const label = {
      class: CLASS_KEYS[row.class_id] ?? String(row.class_id),
      subject: row.subject,
      title_en: row.title_en,
    };
    const current = byKey.get(naturalKey(row));
    if (!current) {
      preview.inserts.push(label);
      continue;
    }
    const changes = COMPARED.filter((col) => {
      const a = col === "price" && current[col] !== null ? Number(current[col]) : current[col];
      const b = row[col];
      return (a ?? null) !== (b ?? null);
    }).map((col) => `${col}: ${current[col] ?? "—"} → ${row[col] ?? "—"}`);

    if (changes.length) preview.updates.push({ ...label, changes });
    else preview.unchangedCount++;
  }
  return preview;
}

/** books table → CSV in the import template's exact column order. */
export function booksToCsv(
  books: {
    class_id: number;
    subject: string;
    title_en: string;
    title_ne: string | null;
    publisher: string | null;
    price: number | string | null;
    status: string;
    units: number;
    expected_arrival: string | null;
  }[]
): string {
  return Papa.unparse(
    books.map((b) => ({
      class: CLASS_KEYS[b.class_id] ?? String(b.class_id),
      subject: b.subject,
      title_en: b.title_en,
      title_ne: b.title_ne ?? "",
      publisher: b.publisher ?? "",
      price: b.price ?? "",
      status: b.status,
      units: b.units,
      expected_arrival: b.expected_arrival ?? "",
    })),
    {
      columns: [
        "class",
        "subject",
        "title_en",
        "title_ne",
        "publisher",
        "price",
        "status",
        "units",
        "expected_arrival",
      ],
    }
  );
}
