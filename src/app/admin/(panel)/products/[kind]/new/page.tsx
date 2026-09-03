import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getProductCategoriesByKind } from "@/lib/product-categories";
import { PRODUCT_KIND_ADMIN, isProductKind } from "@/lib/product-kinds";
import ProductForm from "@/components/admin/ProductForm";
import { saveProduct } from "../actions";

export default async function NewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ added?: string }>;
}) {
  await requireAdmin();
  const { kind } = await params;
  if (!isProductKind(kind)) notFound();

  const { added } = await searchParams;
  const categoriesByKind = await getProductCategoriesByKind(false);

  return (
    <>
      <h1 className="text-2xl font-semibold">
        Add a {PRODUCT_KIND_ADMIN[kind].label.toLowerCase()} item
      </h1>
      {added ? (
        <p className="mt-2 rounded-sm border-[1.5px] border-dashed border-instock px-3 py-2 text-sm font-medium text-instock">
          Saved. Add the next item below.
        </p>
      ) : null}
      <div className="mt-5">
        <ProductForm
          action={saveProduct}
          kind={kind}
          categoriesByKind={categoriesByKind}
        />
      </div>
    </>
  );
}
