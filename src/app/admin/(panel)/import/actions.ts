"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  parseBooksCsv,
  previewBooksImport,
  type ImportPreview,
} from "@/lib/admin/csv";

/**
 * CSV import: dry-run preview first, then commit. One action, two intents;
 * the CSV text round-trips through the commit form so the commit re-parses
 * and re-validates from scratch. Upserts run on the session client (RLS
 * applies); existing cover_path values survive (column not in the upsert).
 */

const CSV_MAX_BYTES = 2 * 1024 * 1024;

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

  if (intent === "preview") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { phase: "error", message: "Choose a CSV file first." };
    }
    if (file.size > CSV_MAX_BYTES) {
      return { phase: "error", message: "CSV is over 2 MB — that is not the book list." };
    }
    const csv = await file.text();
    const preview = await previewBooksImport(supabase, csv, schoolId);
    return { phase: "preview", preview, csv };
  }

  if (intent === "commit") {
    const csv = String(formData.get("csv") ?? "");
    if (!csv.trim() || csv.length > CSV_MAX_BYTES) {
      return { phase: "error", message: "Nothing to import — upload a CSV first." };
    }
    const { rows, errors } = parseBooksCsv(csv, schoolId);
    if (errors.length) {
      return { phase: "error", message: `CSV does not validate: ${errors[0]}` };
    }
    if (!rows.length) return { phase: "error", message: "The CSV has no data rows." };

    const { error } = await supabase
      .from("books")
      .upsert(rows, { onConflict: "school_id,class_id,subject,title_en" });
    if (error) return { phase: "error", message: `Import failed: ${error.message}` };

    updateTag("books");
    return { phase: "done", imported: rows.length };
  }

  return { phase: "error", message: "Unknown action." };
}
