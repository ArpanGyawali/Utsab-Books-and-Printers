import { requireAdmin } from "@/lib/admin/auth";
import { buildBookWorkbook, type TemplateRow } from "@/lib/admin/book-template";
import { classToken } from "@/lib/admin/csv";
import { getBookGenres } from "@/lib/genres";

/**
 * Backup of the whole books table (all schools) as an .xlsx in the exact import
 * template format — dropdowns and all — so the owner can download the current
 * list, edit it, and re-import it. requireAdmin() guards it (/api/* is outside
 * the proxy matcher; RLS backs it up).
 */
export async function GET() {
  const { supabase } = await requireAdmin();

  const { data: books, error } = await supabase
    .from("books")
    .select("class_id, subject, title_en, title_ne, publisher, price, status, units, expected_arrival, stream, genre")
    .order("class_id", { nullsFirst: false })
    .order("genre")
    .order("subject")
    .order("title_en");
  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  const genres = await getBookGenres(false);
  const rows: TemplateRow[] = books.map((b) => ({
    class: classToken(b.class_id),
    subject: b.subject,
    title_en: b.title_en,
    title_ne: b.title_ne ?? "",
    publisher: b.publisher ?? "",
    price: b.price ?? "",
    status: b.status,
    units: b.units,
    expected_arrival: b.expected_arrival ?? "",
    stream: b.stream ?? "",
    genre: b.genre ?? "",
  }));

  const buffer = await buildBookWorkbook(genres.map((g) => g.slug), rows);
  const today = new Date().toISOString().slice(0, 10);
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="utsab-books-${today}.xlsx"`,
    },
  });
}
