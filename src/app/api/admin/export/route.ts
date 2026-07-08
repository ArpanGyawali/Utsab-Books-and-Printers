import { requireAdmin } from "@/lib/admin/auth";
import { booksToCsv } from "@/lib/admin/csv";

/**
 * CSV backup of the whole books table (all schools), in the import template's
 * column order. requireAdmin() guards it — /api/* is outside the proxy
 * matcher, so the route enforces auth itself (and RLS backs it up).
 */
export async function GET() {
  const { supabase } = await requireAdmin();

  const { data: books, error } = await supabase
    .from("books")
    .select("class_id, subject, title_en, title_ne, publisher, price, status, units, expected_arrival")
    .order("class_id")
    .order("subject")
    .order("title_en");
  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(booksToCsv(books), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="utsab-books-${today}.csv"`,
    },
  });
}
