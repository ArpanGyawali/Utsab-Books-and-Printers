/**
 * CSV → books importer (Phase 3). The Phase 4 admin "CSV import" screen
 * reuses this exact template and upsert key.
 *
 *   npm run db:import                      # imports data/books.sample.csv
 *   npm run db:import -- data/books.csv    # imports a specific file
 *
 * Template columns (see data/README.md):
 *   class,subject,title_en,title_ne,publisher,price,status,units,expected_arrival
 *
 * Upserts on the natural key (school_id, class_id, subject, title_en) into the
 * single active school, so re-importing an updated spreadsheet is safe.
 * Uses the service-role key — run locally only, never expose it.
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const CSV_PATH = process.argv[2] ?? "data/books.sample.csv";
const STATUSES = new Set(["in_stock", "out_of_stock", "arriving"]);

// Must match the seeded `classes` rows (0002_seed.sql).
const CLASS_IDS = {
  nursery: 1,
  lkg: 2,
  ukg: 3,
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i + 1), i + 4])),
};

/** ०-९ → 0-9 (owner may type Devanagari numerals in the spreadsheet). */
const toAsciiDigits = (s) => s.replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const csv = await readFile(CSV_PATH, "utf8");
const { data: rawRows, errors: parseErrors } = Papa.parse(csv.trim(), {
  header: true,
  skipEmptyLines: true,
  transform: (v) => v.trim(),
});
if (parseErrors.length) {
  for (const e of parseErrors) console.error(`CSV parse error (row ${e.row}): ${e.message}`);
  process.exit(1);
}

const { data: schools, error: schoolErr } = await supabase
  .from("schools")
  .select("id, slug, name_en")
  .eq("active", true);
if (schoolErr) {
  console.error("Could not read schools:", schoolErr.message);
  process.exit(1);
}
if (schools.length !== 1) {
  console.error(
    `Expected exactly 1 active school, found ${schools.length}. Pass a school explicitly once multi-school lands.`
  );
  process.exit(1);
}
const school = schools[0];

const rows = [];
const errors = [];
rawRows.forEach((r, i) => {
  const line = i + 2; // 1-based + header row
  const classId = CLASS_IDS[toAsciiDigits(r.class ?? "").toLowerCase()];
  if (!classId) return errors.push(`line ${line}: unknown class "${r.class}"`);
  if (!r.subject) return errors.push(`line ${line}: subject is required`);
  if (!r.title_en) return errors.push(`line ${line}: title_en is required`);
  if (!STATUSES.has(r.status)) return errors.push(`line ${line}: bad status "${r.status}"`);

  const price = r.price ? Number(toAsciiDigits(r.price)) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0))
    return errors.push(`line ${line}: bad price "${r.price}"`);

  const units = r.units ? Number.parseInt(toAsciiDigits(r.units), 10) : 0;
  if (!Number.isInteger(units) || units < 0)
    return errors.push(`line ${line}: bad units "${r.units}"`);

  const arrival = r.expected_arrival || null;
  if (arrival && !/^\d{4}-\d{2}-\d{2}$/.test(arrival))
    return errors.push(`line ${line}: expected_arrival must be YYYY-MM-DD, got "${arrival}"`);

  rows.push({
    school_id: school.id,
    class_id: classId,
    subject: r.subject,
    title_en: r.title_en,
    title_ne: r.title_ne || null,
    publisher: r.publisher || null,
    price,
    status: r.status,
    units,
    expected_arrival: arrival,
  });
});

if (errors.length) {
  console.error(`Aborting — ${errors.length} invalid row(s):`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}

// Duplicate natural keys within the file would make the upsert ambiguous.
const seen = new Set();
for (const row of rows) {
  const key = `${row.class_id}|${row.subject}|${row.title_en}`.toLowerCase();
  if (seen.has(key)) {
    console.error(`Aborting — duplicate row in CSV: class ${row.class_id} / ${row.subject} / ${row.title_en}`);
    process.exit(1);
  }
  seen.add(key);
}

const { error: upsertErr } = await supabase
  .from("books")
  .upsert(rows, { onConflict: "school_id,class_id,subject,title_en" });
if (upsertErr) {
  console.error("Upsert failed:", upsertErr.message);
  process.exit(1);
}

const perClass = rows.reduce((acc, r) => acc.set(r.class_id, (acc.get(r.class_id) ?? 0) + 1), new Map());
console.log(`Imported ${rows.length} book(s) into "${school.name_en}" (${school.slug}):`);
for (const [classId, n] of [...perClass].sort((a, b) => a[0] - b[0]))
  console.log(`  class_id ${classId}: ${n}`);
console.log(
  "Spot-check per-class counts against the owner's spreadsheet, then verify Nepali titles render on /ne/books."
);
