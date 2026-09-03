import { isProductKind } from "@/lib/product-kinds";
import type { ProductCategory, ProductKind } from "@/lib/supabase/types";

/**
 * Parsing + validation for the admin item form — stationery and sports items
 * share it, told apart by the hidden `kind` field the route sets. Returns clean
 * column values or a human-readable error.
 *
 * Item photos reuse the book-cover upload constraints verbatim (generic
 * jpg/png/webp, 5 MB) — re-exported so the actions file has a single import.
 */

export { COVER_MAX_BYTES as IMAGE_MAX_BYTES, COVER_TYPES as IMAGE_TYPES } from "./book-form";

/** ०-९ → 0-9 — the owner may type Devanagari numerals on his phone. */
function toAsciiDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
}

const str = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

export type ProductColumns = {
  name_en: string;
  name_ne: string | null;
  kind: ProductKind;
  category: ProductCategory;
  price: number | null;
  visible: boolean;
};

export function parseProductForm(
  fd: FormData
): { ok: true; data: ProductColumns } | { ok: false; error: string } {
  const name_en = str(fd, "name_en");
  if (!name_en) return { ok: false, error: "Item name (English) is required." };

  // Kind comes from the route the form was opened in, not from user input.
  const kind = str(fd, "kind");
  if (!isProductKind(kind)) return { ok: false, error: "Unknown item type." };

  // Category is a slug from that kind's admin-managed list (the form's <select>
  // is populated from it); the composite foreign key rejects anything else —
  // including a category belonging to the other kind.
  const category = str(fd, "category");
  if (!category) return { ok: false, error: "Pick a category." };

  const rawPrice = toAsciiDigits(str(fd, "price"));
  const price = rawPrice === "" ? null : Number(rawPrice);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: `"${rawPrice}" is not a valid price. Leave empty for "Ask".` };
  }

  return {
    ok: true,
    data: {
      name_en,
      name_ne: str(fd, "name_ne") || null,
      kind,
      category,
      price,
      visible: fd.get("visible") === "on",
    },
  };
}
