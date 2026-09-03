import { requireAdmin } from "@/lib/admin/auth";
import { getBookGenres } from "@/lib/genres";
import { getProductCategories } from "@/lib/product-categories";
import ListManager from "@/components/admin/ListManager";
import {
  saveGenre,
  deleteGenre,
  saveStationeryCategory,
  deleteStationeryCategory,
  saveSportsCategory,
  deleteSportsCategory,
} from "./actions";

/**
 * Manage the admin taxonomies. Adding one here makes it appear immediately in
 * the matching form dropdown, the public filter chips, and (for genres) the
 * import template's dropdown. Deleting one that's still in use is blocked.
 */
export default async function ListsPage() {
  await requireAdmin();
  const [genres, stationery, sports] = await Promise.all([
    getBookGenres(false),
    getProductCategories("stationery", false),
    getProductCategories("sports", false),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Lists</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The book types, stationery categories and sports categories customers
        can filter by. The Nepali name shows on the public site; hidden ones drop
        off the filters but keep their items.
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
          rows={stationery}
          saveAction={saveStationeryCategory}
          deleteAction={deleteStationeryCategory}
        />
        <ListManager
          title="Sports categories"
          noun="category"
          rows={sports}
          saveAction={saveSportsCategory}
          deleteAction={deleteSportsCategory}
        />
      </div>
    </>
  );
}
