import { requireAdmin } from "@/lib/admin/auth";
import { buildBookWorkbook } from "@/lib/admin/book-template";
import { getBookGenres } from "@/lib/genres";

/**
 * Blank .xlsx book-list template with dropdown (data-validation) cells on the
 * constrained columns — the owner picks values instead of typing them into a
 * failed import. Same format as the "download current list" backup. The genre
 * list is the live admin-managed set. requireAdmin() guards it (/api/* is
 * outside the proxy matcher).
 */
export async function GET() {
  await requireAdmin();
  const genres = await getBookGenres(false); // any existing slug is a valid FK

  const buffer = await buildBookWorkbook(genres.map((g) => g.slug));
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="utsab-books-template.xlsx"',
    },
  });
}
