"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

/**
 * Manage the two admin taxonomies (book genres, stationery categories). Each
 * is a small slug-keyed lookup table with bilingual labels. Writes run on the
 * session client so RLS `is_admin()` applies.
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

/** Config for the two near-identical taxonomies. */
const TABLES = {
  genre: {
    table: "book_genres" as const,
    tag: "books" as const,
    noun: "book type",
  },
  category: {
    table: "stationery_categories" as const,
    tag: "products" as const,
    noun: "category",
  },
};
type Kind = keyof typeof TABLES;

async function saveRow(kind: Kind, fd: FormData): Promise<ListState> {
  const { supabase } = await requireAdmin();
  const cfg = TABLES[kind];

  const name_en = str(fd, "name_en");
  if (!name_en) return { error: "English name is required." };
  const name_ne = str(fd, "name_ne") || null;
  const active = fd.get("active") === "on";
  const existingSlug = str(fd, "slug");

  if (existingSlug) {
    // Edit — labels + active only; slug is immutable.
    if (!SLUG_RE.test(existingSlug)) return { error: "Bad id." };
    const { error } = await supabase
      .from(cfg.table)
      .update({ name_en, name_ne, active })
      .eq("slug", existingSlug);
    if (error) return { error: `Could not save: ${error.message}` };
  } else {
    // Create — derive the slug from the English name.
    const slug = slugify(name_en);
    if (!slug) return { error: "That name has no usable letters or digits." };
    const { error } = await supabase
      .from(cfg.table)
      .insert({ slug, name_en, name_ne, active });
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

async function deleteRow(kind: Kind, fd: FormData): Promise<ListState> {
  const { supabase } = await requireAdmin();
  const cfg = TABLES[kind];
  const slug = str(fd, "slug");
  if (!SLUG_RE.test(slug)) return { error: "Bad id." };

  const { error } = await supabase.from(cfg.table).delete().eq("slug", slug);
  if (error) {
    // FK restrict (23503) = still referenced. Count them for a clear message
    // (returned inline, not thrown — "still in use" is an expected outcome).
    // Concrete table/column literals per kind so the typed client resolves.
    if (error.code === "23503") {
      const { count } =
        kind === "genre"
          ? await supabase
              .from("books")
              .select("id", { count: "exact", head: true })
              .eq("genre", slug)
          : await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("category", slug);
      const noun = kind === "genre" ? "books" : "items";
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
export async function saveCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return saveRow("category", fd);
}
export async function deleteGenre(_p: ListState, fd: FormData): Promise<ListState> {
  return deleteRow("genre", fd);
}
export async function deleteCategory(_p: ListState, fd: FormData): Promise<ListState> {
  return deleteRow("category", fd);
}
