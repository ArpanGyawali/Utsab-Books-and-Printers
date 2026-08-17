import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";
import type { BookGenre } from "./supabase/types";

/**
 * Book genres — the "Other books" shelf (religious, children's, novels…),
 * now admin-managed via /admin/lists and stored in the `book_genres` table.
 *
 * Reads are cached under the "books" tag, so the same revalidation that fires
 * on any book edit (and the taxonomy admin actions) keeps labels fresh. The
 * try/catch sits OUTSIDE the cache so a DB error isn't cached (mirrors
 * lib/books.ts). Kept free of server-only writes so RSC pages and admin
 * screens both import it.
 */

const getBookGenresCached = unstable_cache(
  async (activeOnly: boolean): Promise<BookGenre[]> => {
    let query = supabaseServer()
      .from("book_genres")
      .select("*")
      .order("sort")
      .order("name_en");
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },
  ["book-genres-v1"],
  { tags: ["books"] }
);

/** Public pages pass activeOnly=true; admin screens pass false to see all. */
export async function getBookGenres(activeOnly = true): Promise<BookGenre[]> {
  try {
    return await getBookGenresCached(activeOnly);
  } catch (err) {
    console.warn("[genres] query failed:", (err as Error).message);
    return [];
  }
}

/** Locale-aware genre label with cross-locale fallback (SKILL.md i18n rules). */
export function genreLabel(genre: BookGenre, locale: string): string {
  if (locale === "ne") return genre.name_ne || genre.name_en;
  return genre.name_en || genre.name_ne || "";
}
