"use server";

import ExcelJS from "exceljs";
import Papa from "papaparse";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  parseBooksCsv,
  previewBooksImport,
  type ImportPreview,
} from "@/lib/admin/csv";
import { getBookGenres } from "@/lib/genres";

/**
 * Book import: dry-run preview first, then commit. Accepts the .xlsx template
 * (with dropdowns) or a plain .csv — an .xlsx is converted to CSV text at the
 * door, so everything downstream is identical. One action, two intents; the
 * CSV text round-trips through the commit form so the commit re-parses and
 * re-validates from scratch. Upserts run on the session client (RLS applies);
 * existing cover_path values survive (column not in the upsert).
 */

const CSV_MAX_BYTES = 4 * 1024 * 1024;

/** exceljs cell → plain text (handles rich text, formula results, blanks). */
function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v == null) return "";
  if (typeof v === "object") {
    if ("text" in v && v.text != null) return String(v.text);
    if ("result" in v && v.result != null) return String(v.result);
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return "";
  }
  return String(v);
}

/** Read the first worksheet of an uploaded .xlsx into the CSV text the parser expects. */
async function xlsxToCsv(buf: ArrayBuffer): Promise<string> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) return "";
  const header: string[] = [];
  const headerRow = ws.getRow(1);
  for (let c = 1; c <= headerRow.cellCount; c++) {
    header.push(cellText(headerRow.getCell(c)).trim());
  }
  const aoa: string[][] = [header];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cells = header.map((_, i) => cellText(row.getCell(i + 1)));
    if (cells.some((x) => x.trim() !== "")) aoa.push(cells);
  });
  return Papa.unparse(aoa);
}

/** Reads an uploaded book list (.xlsx or .csv) into CSV text. */
async function fileToCsv(file: File): Promise<string> {
  const isXlsx =
    file.name.toLowerCase().endsWith(".xlsx") ||
    file.type.includes("spreadsheetml");
  return isXlsx ? xlsxToCsv(await file.arrayBuffer()) : file.text();
}

export type ImportState =
  | { phase: "idle" }
  | { phase: "preview"; preview: ImportPreview; csv: string }
  | { phase: "done"; imported: number }
  | { phase: "error"; message: string };

export async function importAction(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const { supabase } = await requireAdmin();

  const { data: schools, error: schoolErr } = await supabase
    .from("schools")
    .select("id")
    .eq("active", true);
  if (schoolErr) {
    return { phase: "error", message: `Could not read schools: ${schoolErr.message}` };
  }
  if (schools.length !== 1) {
    return {
      phase: "error",
      message: `Expected exactly 1 active school, found ${schools.length} — the import targets the single active school.`,
    };
  }
  const schoolId = schools[0].id;

  const intent = String(formData.get("intent") ?? "");

  // Any existing genre slug is a valid FK value (active or not).
  const validGenres = new Set((await getBookGenres(false)).map((g) => g.slug));

  if (intent === "preview") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { phase: "error", message: "Choose a CSV or Excel file first." };
    }
    if (file.size > CSV_MAX_BYTES) {
      return { phase: "error", message: "File is over 4 MB — that is not the book list." };
    }
    const csv = await fileToCsv(file);
    const preview = await previewBooksImport(supabase, csv, schoolId, validGenres);
    return { phase: "preview", preview, csv };
  }

  if (intent === "commit") {
    const csv = String(formData.get("csv") ?? "");
    if (!csv.trim() || csv.length > CSV_MAX_BYTES) {
      return { phase: "error", message: "Nothing to import — upload a file first." };
    }
    const { rows, errors } = parseBooksCsv(csv, schoolId, validGenres);
    if (errors.length) {
      return { phase: "error", message: `CSV does not validate: ${errors[0]}` };
    }
    if (!rows.length) return { phase: "error", message: "The CSV has no data rows." };

    // Two natural keys, two upserts: textbooks conflict on class+subject+title,
    // other books (blank class + genre, e.g. from a backup export) on genre+title.
    const textbooks = rows.filter((r) => r.class_id !== null);
    const otherBooks = rows.filter((r) => r.class_id === null);
    if (textbooks.length) {
      const { error } = await supabase
        .from("books")
        .upsert(textbooks, { onConflict: "school_id,class_id,subject,title_en" });
      if (error) return { phase: "error", message: `Import failed: ${error.message}` };
    }
    if (otherBooks.length) {
      const { error } = await supabase
        .from("books")
        .upsert(otherBooks, { onConflict: "school_id,genre,title_en" });
      if (error) return { phase: "error", message: `Import failed: ${error.message}` };
    }

    updateTag("books");
    return { phase: "done", imported: rows.length };
  }

  return { phase: "error", message: "Unknown action." };
}
