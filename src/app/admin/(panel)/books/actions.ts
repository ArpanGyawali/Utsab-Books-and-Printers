"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  COVER_MAX_BYTES,
  COVER_TYPES,
  parseBookForm,
} from "@/lib/admin/book-form";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Book mutations. Every action re-verifies the admin session (requireAdmin)
 * and runs its DB writes on the session client, so RLS `is_admin()` enforces
 * authorization inside Postgres too. The service-role client touches ONLY
 * storage (the public covers bucket has no anon/authenticated write policies
 * by design — see migration 0003).
 */

export type FormState = { error: string } | null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Uploads a new cover and returns its storage path; removes the old object. */
async function replaceCover(
  bookId: string,
  file: File,
  oldPath: string | null
): Promise<{ path: string } | { error: string }> {
  const ext = COVER_TYPES[file.type];
  if (!ext) return { error: "Cover must be a JPG, PNG or WebP image." };
  if (file.size > COVER_MAX_BYTES) return { error: "Cover image is over 5 MB." };

  // Timestamped name: a re-upload gets a fresh URL, so no stale CDN/browser
  // caches; the previous object is removed right after.
  const path = `${bookId}-${Date.now()}.${ext}`;
  const storage = supabaseAdmin().storage.from("covers");

  const { error } = await storage.upload(path, await file.arrayBuffer(), {
    contentType: file.type,
  });
  if (error) return { error: `Cover upload failed: ${error.message}` };
  if (oldPath) await storage.remove([oldPath]);
  return { path };
}

export async function saveBook(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (id && !UUID_RE.test(id)) return { error: "Bad book id." };

  const parsed = parseBookForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  // Current cover (edit only) — needed for replacement/removal below.
  let coverPath: string | null = null;
  if (id) {
    const { data: existing, error } = await supabase
      .from("books")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    if (error || !existing) return { error: "Book not found." };
    coverPath = existing.cover_path;
  }

  const file = formData.get("cover");
  const removeCover = formData.get("remove_cover") === "on";
  const storage = supabaseAdmin().storage.from("covers");

  let bookId = id;
  if (!id) {
    const { data: inserted, error } = await supabase
      .from("books")
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) {
      return {
        error: error.code === "23505"
          ? "This book already exists for that school, class and subject."
          : `Could not save: ${error.message}`,
      };
    }
    bookId = inserted.id;
  }

  let newCoverPath = coverPath;
  if (file instanceof File && file.size > 0) {
    const result = await replaceCover(bookId, file, coverPath);
    if ("error" in result) return { error: result.error };
    newCoverPath = result.path;
  } else if (removeCover && coverPath) {
    await storage.remove([coverPath]);
    newCoverPath = null;
  }

  const { error: updateErr } = await supabase
    .from("books")
    .update({ ...parsed.data, cover_path: newCoverPath })
    .eq("id", bookId);
  if (updateErr) {
    return {
      error: updateErr.code === "23505"
        ? "This book already exists for that school, class and subject."
        : `Could not save: ${updateErr.message}`,
    };
  }

  updateTag("books");
  redirect("/admin/books");
}

export async function deleteBook(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) return;

  const { data: book } = await supabase
    .from("books")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();

  // Waiting-list rows go with the book (FK is on delete cascade).
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  if (book?.cover_path) {
    await supabaseAdmin().storage.from("covers").remove([book.cover_path]);
  }

  updateTag("books");
  redirect("/admin/books");
}
