import { unstable_cache } from "next/cache";
import { PRODUCT_KINDS } from "./product-kinds";
import { supabaseServer } from "./supabase/server";
import type { ProductCategoryRow, ProductKind } from "./supabase/types";

/**
 * Showcase categories, admin-managed via /admin/lists and stored in the
 * `product_categories` table. Each kind (stationery, sports) owns its own list,
 * so every read is scoped by kind. Reads are cached under the "products" tag so
 * the same revalidation that fires on any product edit (and the taxonomy admin
 * actions) keeps labels fresh; the try/catch sits OUTSIDE the cache so a DB
 * error isn't cached (mirrors lib/books.ts). No server-only writes here so the
 * public page, admin pages and the client form can all import it.
 */

const getProductCategoriesCached = unstable_cache(
  async (kind: ProductKind, activeOnly: boolean): Promise<ProductCategoryRow[]> => {
    let query = supabaseServer()
      .from("product_categories")
      .select("*")
      .eq("kind", kind)
      .order("sort")
      .order("name_en");
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },
  ["product-categories-v2"],
  { tags: ["products"] }
);

/** Public page passes activeOnly=true; admin screens pass false to see all. */
export async function getProductCategories(
  kind: ProductKind,
  activeOnly = true
): Promise<ProductCategoryRow[]> {
  try {
    return await getProductCategoriesCached(kind, activeOnly);
  } catch (err) {
    console.warn("[categories] query failed:", (err as Error).message);
    return [];
  }
}

/**
 * Both lists at once, keyed by kind — what the admin item form needs so the
 * owner can move an item from Stationery to Sports (and get that kind's
 * categories) without a round trip.
 */
export async function getProductCategoriesByKind(
  activeOnly = false
): Promise<Record<ProductKind, ProductCategoryRow[]>> {
  const lists = await Promise.all(
    PRODUCT_KINDS.map((kind) => getProductCategories(kind, activeOnly))
  );
  return Object.fromEntries(
    PRODUCT_KINDS.map((kind, i) => [kind, lists[i]])
  ) as Record<ProductKind, ProductCategoryRow[]>;
}

/** Locale-aware category label with cross-locale fallback (SKILL.md i18n rules). */
export function categoryLabel(
  category: ProductCategoryRow,
  locale: string
): string {
  if (locale === "ne") return category.name_ne || category.name_en;
  return category.name_en || category.name_ne || "";
}
