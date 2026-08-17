import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { getStationeryCategories } from "@/lib/product-categories";
import { productImageUrl } from "@/lib/products";
import { deleteProduct, saveProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    getStationeryCategories(false),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="text-2xl font-semibold">Edit item</h1>
      <p className="mt-1 truncate text-sm text-ink-soft">
        {product.name_en}
        {product.name_ne ? ` · ${product.name_ne}` : ""}
      </p>

      <div className="mt-5">
        <ProductForm
          action={saveProduct}
          product={product}
          imageUrl={productImageUrl(product)}
          categories={categories}
        />
      </div>

      <form action={deleteProduct} className="mt-8 border-t border-dashed border-[var(--ink-faint)] pt-5">
        <input type="hidden" name="id" value={product.id} />
        <ConfirmSubmit
          message={`Delete "${product.name_en}"? This cannot be undone.`}
          className="min-h-11 rounded-sm border-[1.5px] border-outofstock px-4 text-sm font-medium text-outofstock transition-colors duration-150 hover:bg-paper-shade"
        >
          Delete this item
        </ConfirmSubmit>
      </form>
    </>
  );
}
