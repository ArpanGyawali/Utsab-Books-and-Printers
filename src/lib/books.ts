import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";
import type { Book, ClassRow } from "./supabase/types";

/**
 * Cached catalog reads for the public Look-for-Book page.
 * Tagged 'books' — every admin mutation (Phase 4) and the CSV import route
 * call revalidateTag('books') so the public page updates immediately.
 *
 * The try/catch lives OUTSIDE the unstable_cache wrapper on purpose: thrown
 * errors are not cached, so a DB outage (or missing env at deploy time) is
 * retried on the next request instead of being served forever. The public
 * callers receive null and degrade to a WhatsApp handoff — "never a dead end".
 * (Key parts carry a -v2 suffix to abandon entries poisoned by the previous
 * failure-caching version.)
 */

const getClassesCached = unstable_cache(
  async (): Promise<ClassRow[]> => {
    const { data, error } = await supabaseServer()
      .from("classes")
      .select("*")
      .order("sort");
    if (error) throw new Error(error.message);
    return data;
  },
  ["classes-v2"],
  { tags: ["books"] }
);

export async function getClasses(): Promise<ClassRow[] | null> {
  try {
    return await getClassesCached();
  } catch (err) {
    console.warn("[books] classes unavailable:", (err as Error).message);
    return null;
  }
}

/** Strips PostgREST filter metacharacters; keeps letters (incl. Devanagari), digits, spaces. */
function sanitizeQuery(q: string): string {
  return q.replace(/[%_,.()"'\\*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

const getBooksCached = unstable_cache(
  async (classId: number | null, rawQuery: string | null): Promise<Book[]> => {
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
  },
  ["books-list-v2"],
  { tags: ["books"] }
);

export async function getBooks(
  classId: number | null,
  rawQuery: string | null
): Promise<Book[] | null> {
  try {
    return await getBooksCached(classId, rawQuery);
  } catch (err) {
    console.warn("[books] query failed:", (err as Error).message);
    return null;
  }
}

/** Public URL of an admin-uploaded front cover; null = show the placeholder. */
export function coverUrl(book: Book): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!book.cover_path || !base) return null;
  return `${base}/storage/v1/object/public/covers/${book.cover_path}`;
}

/** Locale-aware book title with cross-locale fallback (SKILL.md i18n rules). */
export function bookTitle(book: Book, locale: string): string {
  if (locale === "ne") return book.title_ne || book.title_en;
  return book.title_en || book.title_ne || "";
}

export function className(cls: ClassRow, locale: string): string {
  return locale === "ne" ? cls.name_ne : cls.name_en;
}
