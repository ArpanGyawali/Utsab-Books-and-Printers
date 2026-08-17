import { requireAdmin } from "@/lib/admin/auth";
import { getStationeryCategories } from "@/lib/product-categories";
import ProductForm from "@/components/admin/ProductForm";
import { saveProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireAdmin();
  const { added } = await searchParams;
  const categories = await getStationeryCategories(false);

  return (
    <>
      <h1 className="text-2xl font-semibold">Add a stationery item</h1>
      {added ? (
        <p className="mt-2 rounded-sm border-[1.5px] border-dashed border-instock px-3 py-2 text-sm font-medium text-instock">
          Saved. Add the next item below.
        </p>
      ) : null}
      <div className="mt-5">
        <ProductForm action={saveProduct} categories={categories} />
      </div>
    </>
  );
}
