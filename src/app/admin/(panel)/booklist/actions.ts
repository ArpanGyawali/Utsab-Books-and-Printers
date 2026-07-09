"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { imageSize } from "@/lib/admin/image-size";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Saves the school/college book list (site_settings key 'booklist'): typed
 * text plus at most one uploaded photo or PDF in the public 'booklists'
 * bucket. Storage writes use the service-role client (bucket has no
 * anon/authenticated policies, same as covers); the settings upsert runs on
 * the session client so RLS re-checks the admin.
 */

export type BooklistState = { ok: true } | { error: string } | null;

const FILE_TYPES: Record<string, { ext: string; kind: "image" | "pdf" }> = {
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/png": { ext: "png", kind: "image" },
  "application/pdf": { ext: "pdf", kind: "pdf" },
};
const FILE_MAX_BYTES = 6 * 1024 * 1024;
const TEXT_MAX_CHARS = 10_000;

export async function saveBooklist(
  _prev: BooklistState,
  formData: FormData
): Promise<BooklistState> {
  const { supabase } = await requireAdmin();

  const text = String(formData.get("text") ?? "").trim().slice(0, TEXT_MAX_CHARS);
  const file = formData.get("file");
  const removeFile = formData.get("remove_file") === "on";

  // Current value — needed to keep or delete the existing upload.
  const { data: row, error: readErr } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "booklist")
    .maybeSingle();
  if (readErr) return { error: `Could not read the current list: ${readErr.message}` };
  const current = (row?.value ?? {}) as {
    file_path?: string | null;
    file_type?: "image" | "pdf" | null;
    file_w?: number | null;
    file_h?: number | null;
  };

  let file_path = current.file_path ?? null;
  let file_type = current.file_type ?? null;
  let file_w = current.file_w ?? null;
  let file_h = current.file_h ?? null;

  const storage = supabaseAdmin().storage.from("booklists");

  if (file instanceof File && file.size > 0) {
    const type = FILE_TYPES[file.type];
    if (!type) return { error: "The list must be a JPG or PNG photo, or a PDF." };
    if (file.size > FILE_MAX_BYTES) return { error: "File is over 6 MB — send a smaller one." };

    const bytes = new Uint8Array(await file.arrayBuffer());
    const dims = type.kind === "image" ? imageSize(bytes, file.type) : null;

    // Timestamped name → fresh URL on re-upload, no stale caches (as covers do).
    const path = `booklist-${Date.now()}.${type.ext}`;
    const { error } = await storage.upload(path, bytes, { contentType: file.type });
    if (error) return { error: `Upload failed: ${error.message}` };
    if (file_path) await storage.remove([file_path]);

    file_path = path;
    file_type = type.kind;
    file_w = dims?.w ?? null;
    file_h = dims?.h ?? null;
  } else if (removeFile && file_path) {
    await storage.remove([file_path]);
    file_path = null;
    file_type = null;
    file_w = null;
    file_h = null;
  }

  const { error } = await supabase.from("site_settings").upsert({
    key: "booklist",
    value: {
      text,
      file_path,
      file_type,
      file_w,
      file_h,
      updated_at: new Date().toISOString(),
    },
  });
  if (error) return { error: `Could not save: ${error.message}` };

  updateTag("settings");
  return { ok: true };
}
