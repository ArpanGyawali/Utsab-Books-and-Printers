import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getStationeryCategories } from "@/lib/product-categories";
import { productImageUrl } from "@/lib/products";
import { toggleProductVisible } from "./actions";

/** Stationery items → tap a row to edit; quick show/hide without leaving. */

export default async function AdminStationeryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  // Admin-managed categories drive the filter chips + row labels (English-only).
  const categories = await getStationeryCategories(false);
  const categoryLabelBySlug = new Map(categories.map((c) => [c.slug, c.name_en]));
  const raw = params.category ?? "";
  const category = categoryLabelBySlug.has(raw) ? raw : "";

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (category) query = query.eq("category", category);

  const { data: products, error } = await query;

  const filters: { value: string; label: string }[] = [
    { value: "", label: "All" },
    ...categories.map((c) => ({ value: c.slug, label: c.name_en })),
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Stationery</h1>
        <Link
          href="/admin/stationery/new"
          className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-4 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
        >
          + Add item
        </Link>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(({ value, label }) => {
          const active = category === value;
          const href = value
            ? `/admin/stationery?category=${value}`
            : "/admin/stationery";
          return (
            <Link
              key={label}
              href={href}
              className={`inline-flex min-h-9 shrink-0 items-center rounded-sm border-[1.5px] px-3 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-[var(--ink-faint)] text-ink-soft hover:bg-paper-shade"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-outofstock">
          Could not load items: {error.message}
        </p>
      ) : !products?.length ? (
        <p className="mt-6 text-sm text-ink-soft">
          {category ? "Nothing in this category yet." : "No items yet — add one."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--ink-faint)] rounded-md border border-[var(--ink-faint)] bg-paper">
          {products.map((product) => {
            const image = productImageUrl(product);
            return (
              <li key={product.id} className="flex items-center gap-3 p-3">
                <Link
                  href={`/admin/stationery/${product.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 transition-colors duration-150 hover:opacity-80"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={44}
                      height={44}
                      sizes="44px"
                      className="h-11 w-11 shrink-0 rounded-sm border border-[var(--ink-faint)] object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-sm border border-dashed border-[var(--ink-faint)] bg-paper-shade/70 text-lg font-semibold text-ink-soft/35"
                    >
                      {product.name_en.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{product.name_en}</span>
                      {!product.visible ? (
                        <span className="shrink-0 rounded-sm border border-[var(--ink-faint)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                          Hidden
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-sm text-ink-soft">
                      {[
                        categoryLabelBySlug.get(product.category) ?? product.category,
                        product.price !== null ? `Rs. ${Number(product.price)}` : "Ask",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </Link>

                {/* Quick show/hide — a sibling form, not nested in the row link */}
                <form action={toggleProductVisible} className="shrink-0">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="visible" value={product.visible ? "false" : "true"} />
                  {category ? (
                    <input type="hidden" name="category" value={category} />
                  ) : null}
                  <button
                    type="submit"
                    className="min-h-11 rounded-sm border-[1.5px] border-[var(--ink-faint)] px-3 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-paper-shade hover:text-ink"
                  >
                    {product.visible ? "Hide" : "Show"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
