import { requireAdmin } from "@/lib/admin/auth";
import { getBookGenres } from "@/lib/genres";
import { getStationeryCategories } from "@/lib/product-categories";
import ListManager from "@/components/admin/ListManager";
import { saveGenre, deleteGenre, saveCategory, deleteCategory } from "./actions";

/**
 * Manage the two admin taxonomies. Adding one here makes it appear immediately
 * in the matching form dropdown, the public filter chips, and (for genres) the
 * import template's dropdown. Deleting one that's still in use is blocked.
 */
export default async function ListsPage() {
  await requireAdmin();
  const [genres, categories] = await Promise.all([
    getBookGenres(false),
    getStationeryCategories(false),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Lists</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The book types and stationery categories customers can filter by. The
        Nepali name shows on the public site; hidden ones drop off the filters
        but keep their items.
      </p>

      <div className="mt-5 grid gap-5">
        <ListManager
          title="Book types (Other-books shelf)"
          noun="book type"
          rows={genres}
          saveAction={saveGenre}
          deleteAction={deleteGenre}
        />
        <ListManager
          title="Stationery categories"
          noun="category"
          rows={categories}
          saveAction={saveCategory}
          deleteAction={deleteCategory}
        />
      </div>
    </>
  );
}
