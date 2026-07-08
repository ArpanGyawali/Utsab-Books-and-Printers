"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Button from "@/components/Button";
import type { FormState } from "@/app/admin/(panel)/books/actions";
import type { Book, BookStatus, ClassRow } from "@/lib/supabase/types";

/**
 * Create/edit book form. Phone-first: 44px targets, three-segment status
 * control, stepper for units. Devanagari input is fine everywhere; numeric
 * fields are normalized server-side.
 */

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

const statusLabels: Record<BookStatus, string> = {
  in_stock: "In stock",
  arriving: "Arriving",
  out_of_stock: "Out of stock",
};

export default function BookForm({
  action,
  book,
  coverUrl,
  schools,
  classes,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  book?: Book;
  coverUrl?: string | null;
  schools: { id: string; name_en: string }[];
  classes: ClassRow[];
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [status, setStatus] = useState<BookStatus>(book?.status ?? "in_stock");
  const [units, setUnits] = useState<number>(book?.units ?? 0);

  return (
    <form action={formAction} className="grid gap-4">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}

      {schools.length > 1 ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">School</span>
          <select name="school_id" defaultValue={book?.school_id} className={inputCls}>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_en}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="school_id" value={schools[0]?.id ?? ""} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Class</span>
          <select
            name="class_id"
            defaultValue={book?.class_id ?? ""}
            required
            className={inputCls}
          >
            <option value="" disabled>
              Pick…
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Subject</span>
          <input
            name="subject"
            defaultValue={book?.subject}
            required
            placeholder="e.g. English"
            className={inputCls}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title (English)</span>
        <input name="title_en" defaultValue={book?.title_en} required className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title (Nepali) — optional</span>
        <input name="title_ne" defaultValue={book?.title_ne ?? ""} className={inputCls} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Publisher — optional</span>
          <input name="publisher" defaultValue={book?.publisher ?? ""} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Price (Rs.)</span>
          <input
            name="price"
            inputMode="decimal"
            defaultValue={book?.price ?? ""}
            placeholder={'Empty = "Ask"'}
            className={inputCls}
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Status</legend>
        <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-sm border-[1.5px] border-ink">
          {(Object.keys(statusLabels) as BookStatus[]).map((s) => (
            <label key={s} className="block">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-11 cursor-pointer items-center justify-center px-1 text-center text-sm font-medium transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-accent ${
                  status === s ? "bg-ink text-paper" : "bg-paper text-ink-soft"
                }`}
              >
                {statusLabels[s]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {status === "in_stock" ? (
        <div>
          <span className="mb-1 block text-sm font-medium">Copies on the shelf</span>
          <div className="flex items-stretch gap-0 overflow-hidden rounded-sm border-[1.5px] border-ink">
            <button
              type="button"
              aria-label="One less copy"
              onClick={() => setUnits((u) => Math.max(0, u - 1))}
              className="min-h-11 w-14 shrink-0 border-r border-[var(--ink-faint)] text-xl font-bold hover:bg-paper-shade"
            >
              −
            </button>
            <input
              name="units"
              inputMode="numeric"
              value={units}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                setUnits(Number.isInteger(n) && n >= 0 ? n : 0);
              }}
              className="w-full border-0 bg-paper text-center text-lg font-semibold tabular-nums"
            />
            <button
              type="button"
              aria-label="One more copy"
              onClick={() => setUnits((u) => u + 1)}
              className="min-h-11 w-14 shrink-0 border-l border-[var(--ink-faint)] text-xl font-bold hover:bg-paper-shade"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <input type="hidden" name="units" value={units} />
      )}

      {status === "arriving" ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Expected arrival</span>
          <input
            type="date"
            name="expected_arrival"
            defaultValue={book?.expected_arrival ?? ""}
            className={inputCls}
          />
        </label>
      ) : null}

      <div className="rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] p-3">
        <span className="mb-2 block text-sm font-medium">Front cover photo — optional</span>
        {coverUrl ? (
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={coverUrl}
              alt="Current cover"
              width={60}
              height={80}
              sizes="60px"
              className="h-20 w-[60px] rounded-sm border border-[var(--ink-faint)] object-cover"
            />
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="remove_cover" className="h-4 w-4 accent-[var(--accent)]" />
              Remove current cover
            </label>
          </div>
        ) : null}
        <input
          type="file"
          name="cover"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[1.5px] file:border-solid file:border-ink file:bg-paper file:px-3 file:font-medium file:text-ink"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          JPG, PNG or WebP, up to 5 MB. A phone photo of the front cover works well.
        </p>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : book ? "Save changes" : "Add book"}
      </Button>
    </form>
  );
}
