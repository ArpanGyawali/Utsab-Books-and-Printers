"use client";

import Image from "next/image";
import { useActionState } from "react";
import Button from "@/components/Button";
import type { BooklistState } from "@/app/admin/(panel)/booklist/actions";

/**
 * Admin editor for the school/college book list: one big textarea (type or
 * paste the list, any language) and an optional photo/PDF of the paper list.
 * Phone-first, same patterns as BookForm.
 */

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

export default function BooklistForm({
  action,
  text,
  fileUrl,
  fileType,
}: {
  action: (prev: BooklistState, formData: FormData) => Promise<BooklistState>;
  text: string;
  fileUrl: string | null;
  fileType: "image" | "pdf" | null;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          The list, typed out — Nepali and English both fine
        </span>
        <textarea
          name="text"
          rows={16}
          defaultValue={text}
          placeholder={"e.g.\nClass 1: मेरो नेपाली · English · Maths …\nClass 2: …"}
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-ink-soft">
          Shown exactly as typed, line by line. Leave empty if you only upload a photo.
        </span>
      </label>

      <div className="rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] p-3">
        <span className="mb-2 block text-sm font-medium">
          Photo or PDF of the paper list — optional
        </span>
        {fileUrl && fileType === "image" ? (
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={fileUrl}
              alt="Current book list photo"
              width={80}
              height={107}
              sizes="80px"
              className="h-[107px] w-20 rounded-sm border border-[var(--ink-faint)] object-cover"
            />
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="remove_file" className="h-4 w-4 accent-[var(--accent)]" />
              Remove current photo
            </label>
          </div>
        ) : null}
        {fileUrl && fileType === "pdf" ? (
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-3 text-sm font-medium"
            >
              Current list (PDF)
            </a>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="remove_file" className="h-4 w-4 accent-[var(--accent)]" />
              Remove current PDF
            </label>
          </div>
        ) : null}
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,application/pdf"
          className="block w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[1.5px] file:border-solid file:border-ink file:bg-paper file:px-3 file:font-medium file:text-ink"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          JPG, PNG or PDF, up to 6 MB. A clear phone photo of the school&apos;s
          printed list works well. Uploading replaces the current one.
        </p>
      </div>

      {state && "error" in state ? (
        <p role="alert" className="text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p role="status" className="text-sm font-medium text-instock">
          Saved — the public page is updated.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save book list"}
      </Button>
    </form>
  );
}
