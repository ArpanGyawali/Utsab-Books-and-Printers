import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";
import type { Book, ClassRow } from "./supabase/types";

/**
 * Cached catalog reads for the public Look-for-Book page.
 * Tagged 'books' — every admin mutation (Phase 4) and the CSV import route
 * call revalidateTag('books') so the public page updates immediately.
 *
 * All functions return null when the database is unreachable (e.g. missing
 * env in a fresh checkout) so the page can degrade to a WhatsApp handoff
 * instead of crashing — "never a dead end".
 */

export const getClasses = unstable_cache(
  async (): Promise<ClassRow[] | null> => {
    try {
      const { data, error } = await supabaseServer()
        .from("classes")
        .select("*")
        .order("sort");
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.warn("[books] classes unavailable:", (err as Error).message);
      return null;
    }
  },
  ["classes"],
  { tags: ["books"] }
);

/** Strips PostgREST filter metacharacters; keeps letters (incl. Devanagari), digits, spaces. */
function sanitizeQuery(q: string): string {
  return q.replace(/[%_,.()"'\\*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export const getBooks = unstable_cache(
  async (classId: number | null, rawQuery: string | null): Promise<Book[] | null> => {
    try {
      const sb = supabaseServer();

      // Single launch school; the schema is multi-school-ready but the public
      // UI hides the picker while exactly one school is active.
      const { data: schools, error: schoolError } = await sb
        .from("schools")
        .select("id")
        .eq("active", true)
        .limit(1);
      if (schoolError) throw new Error(schoolError.message);
      if (!schools?.length) return [];

      let query = sb
        .from("books")
        .select("*")
        .eq("school_id", schools[0].id)
        .order("class_id")
        .order("subject")
        .order("title_en");

      if (classId !== null) query = query.eq("class_id", classId);
      const q = rawQuery ? sanitizeQuery(rawQuery) : "";
      if (q) query = query.ilike("search", `%${q}%`);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.warn("[books] query failed:", (err as Error).message);
      return null;
    }
  },
  ["books-list"],
  { tags: ["books"] }
);

/** Locale-aware book title with cross-locale fallback (SKILL.md i18n rules). */
export function bookTitle(book: Book, locale: string): string {
  if (locale === "ne") return book.title_ne || book.title_en;
  return book.title_en || book.title_ne || "";
}

export function className(cls: ClassRow, locale: string): string {
  return locale === "ne" ? cls.name_ne : cls.name_en;
}
