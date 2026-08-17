import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";
import type { StationeryCategory } from "./supabase/types";

/**
 * Stationery categories, now admin-managed via /admin/lists and stored in the
 * `stationery_categories` table. Reads are cached under the "products" tag so
 * the same revalidation that fires on any product edit (and the taxonomy admin
 * actions) keeps labels fresh; the try/catch sits OUTSIDE the cache so a DB
 * error isn't cached (mirrors lib/books.ts). No server-only writes here so the
 * public page, admin pages and the client form can all import it.
 */

const getStationeryCategoriesCached = unstable_cache(
  async (activeOnly: boolean): Promise<StationeryCategory[]> => {
    let query = supabaseServer()
      .from("stationery_categories")
      .select("*")
      .order("sort")
      .order("name_en");
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },
  ["stationery-categories-v1"],
  { tags: ["products"] }
);

/** Public page passes activeOnly=true; admin screens pass false to see all. */
export async function getStationeryCategories(
  activeOnly = true
): Promise<StationeryCategory[]> {
  try {
    return await getStationeryCategoriesCached(activeOnly);
  } catch (err) {
    console.warn("[categories] query failed:", (err as Error).message);
    return [];
  }
}

/** Locale-aware category label with cross-locale fallback (SKILL.md i18n rules). */
export function categoryLabel(
  category: StationeryCategory,
  locale: string
): string {
  if (locale === "ne") return category.name_ne || category.name_en;
  return category.name_en || category.name_ne || "";
}
