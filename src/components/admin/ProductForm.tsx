"use client";

import Image from "next/image";
import { useActionState } from "react";
import Button from "@/components/Button";
import NepaliInput from "./NepaliInput";
import type { FormState } from "@/app/admin/(panel)/stationery/actions";
import type { Product } from "@/lib/supabase/types";

/**
 * Create/edit stationery-item form. Phone-first (44px targets). Much simpler
 * than BookForm: name, category, optional price, a show/hide switch, one photo.
 * Devanagari input is fine; the price is normalized server-side.
 */

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

export default function ProductForm({
  action,
  product,
  imageUrl,
  categories,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
  imageUrl?: string | null;
  categories: { slug: string; name_en: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="grid gap-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Item name (English)</span>
        <input
          name="name_en"
          defaultValue={product?.name_en}
          required
          placeholder="e.g. Geometry box"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Item name (Nepali) — optional</span>
        <NepaliInput name="name_ne" defaultValue={product?.name_ne ?? ""} className={inputCls} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Category</span>
          <select
            name="category"
            defaultValue={product?.category ?? ""}
            required
            className={inputCls}
          >
            <option value="" disabled>
              Pick…
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Price (Rs.) — optional</span>
          <input
            name="price"
            inputMode="decimal"
            defaultValue={product?.price ?? ""}
            placeholder={'Empty = "Ask"'}
            className={inputCls}
          />
        </label>
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-sm border-[1.5px] border-[var(--ink-faint)] px-3">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={product?.visible ?? true}
          className="h-5 w-5 accent-[var(--accent)]"
        />
        <span className="text-sm font-medium">Show on the website</span>
      </label>

      <div className="rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] p-3">
        <span className="mb-2 block text-sm font-medium">Item photo — optional</span>
        {imageUrl ? (
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={imageUrl}
              alt="Current photo"
              width={60}
              height={60}
              sizes="60px"
              className="h-[60px] w-[60px] rounded-sm border border-[var(--ink-faint)] object-cover"
            />
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="remove_image" className="h-4 w-4 accent-[var(--accent)]" />
              Remove current photo
            </label>
          </div>
        ) : null}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[1.5px] file:border-solid file:border-ink file:bg-paper file:px-3 file:font-medium file:text-ink"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          JPG, PNG or WebP, up to 5 MB. A clear phone photo of the item works well.
        </p>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}

      {product ? (
        <Button type="submit" name="after" value="list" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" name="after" value="again" disabled={pending}>
            {pending ? "Saving…" : "Save & add another"}
          </Button>
          <Button
            type="submit"
            name="after"
            value="list"
            variant="secondary"
            disabled={pending}
          >
            Save & finish
          </Button>
        </div>
      )}
    </form>
  );
}
