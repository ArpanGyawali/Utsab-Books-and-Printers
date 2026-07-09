"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { imageSize } from "@/lib/admin/image-size";
import type { BooklistFile } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Saves the school/college book lists (site_settings key 'booklist'): photos
 * or PDFs of the paper lists in the public 'booklists' bucket, shown as
 * cards on the public Look for Book page. One save applies everything at
 * once — label edits, removals, new uploads. Storage writes use the
 * service-role client (bucket has no anon/authenticated policies, same as
 * covers); the settings upsert runs on the session client so RLS re-checks
 * the admin.
 */

export type BooklistState = { ok: true } | { error: string } | null;

const FILE_TYPES: Record<string, { ext: string; kind: "image" | "pdf" }> = {
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/png": { ext: "png", kind: "image" },
  "application/pdf": { ext: "pdf", kind: "pdf" },
};
const FILE_MAX_BYTES = 6 * 1024 * 1024;
// Server actions cap the whole request at 8 MB (next.config) — keep a margin.
const BATCH_MAX_BYTES = 7 * 1024 * 1024;
const MAX_FILES = 8;
const LABEL_MAX_CHARS = 80;

export async function saveBooklist(
  _prev: BooklistState,
  formData: FormData
): Promise<BooklistState> {
  const { supabase } = await requireAdmin();

  // Current value — source of truth for what exists; the form only sends
  // per-path label edits and remove flags.
  const { data: row, error: readErr } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "booklist")
    .maybeSingle();
  if (readErr) return { error: `Could not read the current lists: ${readErr.message}` };
  const currentRaw = (row?.value as { files?: unknown } | null)?.files;
  const current: BooklistFile[] = Array.isArray(currentRaw)
    ? currentRaw.filter(
        (f): f is BooklistFile =>
          Boolean(f) && typeof f === "object" && typeof (f as BooklistFile).path === "string"
      )
    : [];

  const storage = supabaseAdmin().storage.from("booklists");

  // Apply removals and label edits to the existing files.
  const kept: BooklistFile[] = [];
  const removedPaths: string[] = [];
  for (const file of current) {
    if (formData.get(`remove__${file.path}`) === "on") {
      removedPaths.push(file.path);
      continue;
    }
    const label = String(formData.get(`label__${file.path}`) ?? file.label ?? "")
      .trim()
      .slice(0, LABEL_MAX_CHARS);
    kept.push({ ...file, label });
  }

  // New uploads (input name="files", multiple).
  const uploads = formData.getAll("files").filter(
    (f): f is File => f instanceof File && f.size > 0
  );
  if (kept.length + uploads.length > MAX_FILES) {
    return { error: `Keep it to ${MAX_FILES} lists — remove one before adding more.` };
  }
  const batchBytes = uploads.reduce((sum, f) => sum + f.size, 0);
  if (batchBytes > BATCH_MAX_BYTES) {
    return { error: "Those files together are too big — add them one or two at a time." };
  }

  for (const [i, file] of uploads.entries()) {
    const type = FILE_TYPES[file.type];
    if (!type) return { error: `"${file.name}" is not a JPG, PNG or PDF.` };
    if (file.size > FILE_MAX_BYTES) return { error: `"${file.name}" is over 6 MB.` };

    const bytes = new Uint8Array(await file.arrayBuffer());
    const dims = type.kind === "image" ? imageSize(bytes, file.type) : null;

    // Caption typed alongside the picker — indexes follow the input's order.
    const label = String(formData.get(`new_label_${i}`) ?? "")
      .trim()
      .slice(0, LABEL_MAX_CHARS);

    // Timestamped name → fresh URL, no stale caches (as covers do).
    const path = `booklist-${Date.now()}-${kept.length + 1}.${type.ext}`;
    const { error } = await storage.upload(path, bytes, { contentType: file.type });
    if (error) return { error: `Upload of "${file.name}" failed: ${error.message}` };

    kept.push({
      path,
      type: type.kind,
      w: dims?.w ?? null,
      h: dims?.h ?? null,
      label,
    });
  }

  const { error } = await supabase.from("site_settings").upsert({
    key: "booklist",
    value: { files: kept, updated_at: new Date().toISOString() },
  });
  if (error) return { error: `Could not save: ${error.message}` };

  // Only delete storage objects after the setting no longer references them.
  if (removedPaths.length) await storage.remove(removedPaths);

  updateTag("settings");
  return { ok: true };
}
