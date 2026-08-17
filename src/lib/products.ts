import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";
import type { Product } from "./supabase/types";

/**
 * Cached reads for the public stationery showcase.
 * Tagged 'products' — every admin mutation (save/delete/hide) calls
 * updateTag('products') so the public grid updates immediately.
 *
 * As in lib/books.ts, the try/catch lives OUTSIDE the unstable_cache wrapper so
 * a DB outage isn't cached: callers get null and degrade to a WhatsApp handoff.
 *
 * The whole visible list is cached as ONE entry (≤100 rows); the category chips
 * filter it in the RSC rather than re-querying per category.
 */

const getProductsCached = unstable_cache(
  async (): Promise<Product[]> => {
    // RLS on the anon client already hides invisible rows; the explicit
    // .eq keeps the intent obvious and survives any future policy change.
    const { data, error } = await supabaseServer()
      .from("products")
      .select("*")
      .eq("visible", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  ["products-list-v1"],
  { tags: ["products"] }
);

export async function getProducts(): Promise<Product[] | null> {
  try {
    return await getProductsCached();
  } catch (err) {
    console.warn("[products] query failed:", (err as Error).message);
    return null;
  }
}

/** Public URL of an admin-uploaded item photo; null = show the placeholder. */
export function productImageUrl(product: Product): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!product.image_path || !base) return null;
  return `${base}/storage/v1/object/public/products/${product.image_path}`;
}

/** Locale-aware product name with cross-locale fallback (SKILL.md i18n rules). */
export function productName(product: Product, locale: string): string {
  if (locale === "ne") return product.name_ne || product.name_en;
  return product.name_en || product.name_ne || "";
}
