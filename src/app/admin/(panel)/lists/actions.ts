"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import type { ProductKind } from "@/lib/supabase/types";

/**
 * Manage the admin taxonomies: book genres, plus one category list per showcase
 * kind (stationery, sports). Each is a small slug-keyed lookup table with
 * bilingual labels. Writes run on the session client so RLS `is_admin()` applies.
 *
 * The two category lists live in ONE table (`product_categories`) keyed by
 * (kind, slug), so every category read/write here is scoped by kind — without
 * that scope, editing "Other" under Sports would hit the stationery row too.
 *
 * The slug is generated from the English name on creation and is IMMUTABLE
 * afterwards — it is the foreign-key value on books/products and the CSV genre
 * token. Deleting a value still in use fails on the FK (`on delete restrict`,
 * error 23503); we surface a friendly count instead of the raw error.
 */

export type ListState = { error: string } | null;

const SLUG_RE = /^[a-z0-9_]{1,40}$/;

/** "Art & Craft!" → "art_craft"; used only when creating a new row. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

const str = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

/** Config for the near-identical taxonomies. `kind` is set for categories only. */
const TABLES = {
  genre: {
    table: "book_genres" as const,
    tag: "books" as const,
    noun: "book type",
    kind: null,
  },
  stationery: {
    table: "product_categories" as const,
    tag: "products" as const,
    noun: "stationery category",
    kind: "stationery" as ProductKind,
  },
  sports: {
    table: "product_categories" as const,
    tag: "products" as const,
    noun: "sports category",
    kind: "sports" as ProductKind,
  },
};
type List = keyof typeof TABLES;

async function saveRow(list: List, fd: FormData): Promise<ListState> {
  const { supabase } = await requireAdmin();
  const cfg = TABLES[list];

  const name_en = str(fd, "name_en");
  if (!name_en) return { error: "English name is required." };
  const name_ne = str(fd, "name_ne") || null;
  const active = fd.get("active") === "on";
  const existingSlug = str(fd, "slug");

  if (existingSlug) {
    // Edit — labels + active only; slug is immutable.
    if (!SLUG_RE.test(existingSlug)) return { error: "Bad id." };
    const { error } =
      cfg.kind === null
        ? await supabase
            .from(cfg.table)
            .update({ name_en, name_ne, active })
            .eq("slug", existingSlug)
        : await supabase
            .from(cfg.table)
            .update({ name_en, name_ne, active })
            .eq("kind", cfg.kind)
            .eq("slug", existingSlug);
    if (error) return { error: `Could not save: ${error.message}` };
  } else {
    // Create — derive the slug from the English name.
    const slug = slugify(name_en);
    if (!slug) return { error: "That name has no usable letters or digits." };
    // Concrete table literals per branch (as in deleteRow) so the typed client
    // resolves one row shape instead of a union.
    const { error } =
      cfg.kind === null
        ? await supabase
            .from("book_genres")
            .insert({ slug, name_en, name_ne, active })
        : await supabase
            .from("product_categories")
            .insert({ kind: cfg.kind, slug, name_en, name_ne, active });
    if (error) {
      return {
        error:
          error.code === "23505"
            ? `A ${cfg.noun} with a similar name already exists.`
            : `Could not add: ${error.message}`,
      };
    }
  }

  updateTag(cfg.tag);
  redirect("/admin/lists");
}

async function deleteRow(list: List, fd: FormData): Promise<ListState> {
  const { supabase } = await requireAdmin();
  const cfg = TABLES[list];
  const slug = str(fd, "slug");
  if (!SLUG_RE.test(slug)) return { error: "Bad id." };

  const { error } =
    cfg.kind === null
      ? await supabase.from(cfg.table).delete().eq("slug", slug)
      : await supabase
          .from(cfg.table)
          .delete()
          .eq("kind", cfg.kind)
          .eq("slug", slug);
  if (error) {
    // FK restrict (23503) = still referenced. Count them for a clear message
    // (returned inline, not thrown — "still in use" is an expected outcome).
    // Concrete table/column literals per list so the typed client resolves.
    if (error.code === "23503") {
      const { count } =
        cfg.kind === null
          ? await supabase
              .from("books")
              .select("id", { count: "exact", head: true })
              .eq("genre", slug)
          : await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("kind", cfg.kind)
              .eq("category", slug);
      const noun = cfg.kind === null ? "books" : "items";
      return {
        error: `Still used by ${count ?? "some"} ${noun} — reassign or hide those first, or just hide this one.`,
      };
    }
    return { error: `Delete failed: ${error.message}` };
  }

  updateTag(cfg.tag);
  redirect("/admin/lists");
}

// Bound server actions per taxonomy (useActionState `action={...}` targets).
// A "use server" module may only export async functions — hence declarations,
// not const arrows.
export async function saveGenre(_p: ListState, fd: FormData): Promise<ListState> {
  return saveRow("genre", fd);
}
export async function deleteGenre(_p: ListState, fd: FormData): Promise<ListState> {
  return deleteRow("genre", fd);
}
export async function saveStationeryCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return saveRow("stationery", fd);
}
export async function deleteStationeryCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return deleteRow("stationery", fd);
}
export async function saveSportsCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return saveRow("sports", fd);
}
export async function deleteSportsCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return deleteRow("sports", fd);
}
