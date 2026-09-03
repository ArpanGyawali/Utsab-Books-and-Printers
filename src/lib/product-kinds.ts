import type { ProductKind } from "./supabase/types";

/**
 * The two showcase kinds (migration 0012). Lives in its own module — no
 * server-only imports — so client components (ProductForm) and the public RSC
 * pages can both use it.
 *
 * Order matters: it drives the tab rail on /shop and the admin nav.
 */
export const PRODUCT_KINDS = ["stationery", "sports"] as const;

/** Default when no `?kind=` is given (the tab that opens first). */
export const DEFAULT_PRODUCT_KIND: ProductKind = "stationery";

export function isProductKind(value: string): value is ProductKind {
  return (PRODUCT_KINDS as readonly string[]).includes(value);
}

/** `?kind=` / route segment → a kind, falling back to the default. */
export function toProductKind(value: string | undefined | null): ProductKind {
  return value && isProductKind(value) ? value : DEFAULT_PRODUCT_KIND;
}

/**
 * English-only chrome for the admin screens (the panel is English; only the
 * data is bilingual) plus a per-kind placeholder for the name field.
 */
export const PRODUCT_KIND_ADMIN: Record<
  ProductKind,
  { label: string; example: string }
> = {
  stationery: { label: "Stationery", example: "e.g. Geometry box" },
  sports: { label: "Sports", example: "e.g. Cricket ball" },
};
