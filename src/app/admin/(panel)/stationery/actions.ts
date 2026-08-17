"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  parseProductForm,
} from "@/lib/admin/product-form";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Stationery-product mutations. Like the book actions, every action
 * re-verifies the admin session (requireAdmin) and runs its DB writes on the
 * session client so RLS `is_admin()` enforces authorization in Postgres too.
 * The service-role client touches ONLY storage (the public `products` bucket
 * has no anon/authenticated write policies by design — see migration 0010).
 */

export type FormState = { error: string } | null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Uploads a new photo and returns its storage path; removes the old object. */
async function replaceImage(
  productId: string,
  file: File,
  oldPath: string | null,
): Promise<{ path: string } | { error: string }> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Photo must be a JPG, PNG or WebP image." };
  if (file.size > IMAGE_MAX_BYTES) return { error: "Photo is over 5 MB." };

  // Timestamped name → a re-upload gets a fresh URL (no stale CDN/browser
  // cache); the previous object is removed right after.
  const path = `${productId}-${Date.now()}.${ext}`;
  const storage = supabaseAdmin().storage.from("products");

  const { error } = await storage.upload(path, await file.arrayBuffer(), {
    contentType: file.type,
  });
  if (error) return { error: `Photo upload failed: ${error.message}` };
  if (oldPath) await storage.remove([oldPath]);
  return { path };
}

export async function saveProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (id && !UUID_RE.test(id)) return { error: "Bad item id." };

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  // Current photo (edit only) — needed for replacement/removal below.
  let imagePath: string | null = null;
  if (id) {
    const { data: existing, error } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();
    if (error || !existing) return { error: "Item not found." };
    imagePath = existing.image_path;
  }

  const file = formData.get("image");
  const removeImage = formData.get("remove_image") === "on";
  const storage = supabaseAdmin().storage.from("products");

  // Insert first (edit reuses the id): the storage filename needs the row id.
  let productId = id;
  if (!id) {
    const { data: inserted, error } = await supabase
      .from("products")
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) return { error: `Could not save: ${error.message}` };
    productId = inserted.id;
  }

  let newImagePath = imagePath;
  if (file instanceof File && file.size > 0) {
    const result = await replaceImage(productId, file, imagePath);
    if ("error" in result) return { error: result.error };
    newImagePath = result.path;
  } else if (removeImage && imagePath) {
    await storage.remove([imagePath]);
    newImagePath = null;
  }

  const { error: updateErr } = await supabase
    .from("products")
    .update({ ...parsed.data, image_path: newImagePath })
    .eq("id", productId);
  if (updateErr) return { error: `Could not save: ${updateErr.message}` };

  updateTag("products");
  // "Save & add another" returns to a fresh Add form; plain Save goes to the list.
  redirect(
    formData.get("after") === "again"
      ? "/admin/stationery/new?added=1"
      : "/admin/stationery",
  );
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) return;

  const { data: product } = await supabase
    .from("products")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  if (product?.image_path) {
    await supabaseAdmin().storage.from("products").remove([product.image_path]);
  }

  updateTag("products");
  redirect("/admin/stationery");
}

/** Quick show/hide toggle from the list — flips `visible` in place. */
export async function toggleProductVisible(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!UUID_RE.test(id)) return;
  const visible = formData.get("visible") === "true";

  const { error } = await supabase
    .from("products")
    .update({ visible })
    .eq("id", id);
  if (error) throw new Error(`Could not update: ${error.message}`);

  updateTag("products");
  // Return to the list, keeping the category filter the owner was viewing.
  // The value comes from the list page's own chips; a slug-shaped guard is
  // enough to keep the redirect target clean (the list re-validates it anyway).
  const category = String(formData.get("category") ?? "").trim();
  redirect(
    /^[a-z0-9_]{1,40}$/.test(category)
      ? `/admin/stationery?category=${category}`
      : "/admin/stationery",
  );
}
