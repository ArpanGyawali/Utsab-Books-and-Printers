import type { Genre } from "./supabase/types";

/**
 * Genres for non-school books (books rows with class_id = null) — the
 * "Other books" shelf: religious titles, children's story books, novels.
 * Kept free of server-only imports, same as streams.ts: the admin BookForm
 * (client) and the public books page (RSC) both use it.
 */

export const GENRES: readonly Genre[] = ["religious", "children", "novel", "other"];

/** Admin-panel labels (admin UI is English-only; public labels live in messages). */
export const GENRE_LABELS: Record<Genre, string> = {
  religious: "Religious (dharmik)",
  children: "Children's books",
  novel: "Novels & stories",
  other: "Other",
};

export function isGenre(value: string): value is Genre {
  return (GENRES as readonly string[]).includes(value);
}
