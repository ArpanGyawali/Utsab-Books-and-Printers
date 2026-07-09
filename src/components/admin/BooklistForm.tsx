"use client";

import Image from "next/image";
import { useActionState } from "react";
import Button from "@/components/Button";
import type { BooklistState } from "@/app/admin/(panel)/booklist/actions";

/**
 * Admin editor for the school/college book lists: the uploaded photos/PDFs
 * with a caption and a remove tick each, plus a multi-file picker for new
 * ones. Everything applies on one Save. Phone-first, same patterns as
 * BookForm.
 */

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

export type BooklistFormFile = {
  path: string;
  type: "image" | "pdf";
  label: string;
  url: string | null;
};

export default function BooklistForm({
  action,
  files,
}: {
  action: (prev: BooklistState, formData: FormData) => Promise<BooklistState>;
  files: BooklistFormFile[];
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="grid gap-4">
      {files.length ? (
        <ul className="grid gap-3">
          {files.map((file) => (
            <li
              key={file.path}
              className="flex items-start gap-3 rounded-sm border-[1.5px] border-[var(--ink-faint)] p-3"
            >
              {file.url && file.type === "image" ? (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Image
                    src={file.url}
                    alt={file.label || "Book list"}
                    width={64}
                    height={86}
                    sizes="64px"
                    className="h-[86px] w-16 rounded-sm border border-[var(--ink-faint)] object-cover object-top"
                  />
                </a>
              ) : (
                <a
                  href={file.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[86px] w-16 shrink-0 select-none items-center justify-center rounded-sm border border-[var(--ink-faint)] bg-paper-shade/70 text-xs font-bold tracking-widest text-ink-soft no-underline"
                >
                  PDF
                </a>
              )}
              <div className="min-w-0 flex-1">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Caption — optional</span>
                  <input
                    name={`label__${file.path}`}
                    defaultValue={file.label}
                    placeholder={'e.g. "School — 2083" or "College 11/12"'}
                    className={inputCls}
                  />
                </label>
                <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`remove__${file.path}`}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  Remove this list
                </label>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">
          No lists uploaded yet — visitors see nothing until you add one.
        </p>
      )}

      <div className="rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] p-3">
        <span className="mb-2 block text-sm font-medium">Add lists — photo or PDF</span>
        <input
          type="file"
          name="files"
          multiple
          accept="image/jpeg,image/png,application/pdf"
          className="block w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[1.5px] file:border-solid file:border-ink file:bg-paper file:px-3 file:font-medium file:text-ink"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          JPG, PNG or PDF. A clear phone photo of each printed list works well —
          you can pick several at once (a couple of MB at a time), then add
          captions after saving.
        </p>
      </div>

      {state && "error" in state ? (
        <p role="alert" className="text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p role="status" className="text-sm font-medium text-instock">
          Saved — Look for Book is updated.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save lists"}
      </Button>
    </form>
  );
}
