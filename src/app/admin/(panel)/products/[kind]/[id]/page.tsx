import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { getProductCategoriesByKind } from "@/lib/product-categories";
import { isProductKind } from "@/lib/product-kinds";
import { productImageUrl } from "@/lib/products";
import { deleteProduct, saveProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { kind, id } = await params;
  if (!isProductKind(kind)) notFound();

  const [{ data: product }, categoriesByKind] = await Promise.all([
    // Scoped by kind too, so a stationery id can't be edited through the sports
    // screens (its category dropdown would list the wrong categories).
    supabase.from("products").select("*").eq("id", id).eq("kind", kind).maybeSingle(),
    getProductCategoriesByKind(false),
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
          kind={kind}
          product={product}
          imageUrl={productImageUrl(product)}
          categoriesByKind={categoriesByKind}
        />
      </div>

      <form action={deleteProduct} className="mt-8 border-t border-dashed border-[var(--ink-faint)] pt-5">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="kind" value={kind} />
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
