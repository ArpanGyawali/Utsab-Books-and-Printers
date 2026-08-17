"use client";

import { useActionState } from "react";
import type { ListState } from "@/app/admin/(panel)/lists/actions";
import ConfirmSubmit from "./ConfirmSubmit";
import NepaliInput from "./NepaliInput";

/**
 * Manages one admin taxonomy (book genres OR stationery categories): edit the
 * bilingual labels of existing rows, hide/show them, delete unused ones, and
 * add new ones. Admin UI is English-only chrome; the Nepali field is the
 * public NE label. Each row is two sibling forms (edit + delete) — never
 * nested — each with its own action state so errors show in place.
 */

type Row = {
  slug: string;
  name_en: string;
  name_ne: string | null;
  active: boolean;
};

type Action = (prev: ListState, fd: FormData) => Promise<ListState>;

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-2.5 py-2 " +
  "text-sm text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

export default function ListManager({
  title,
  noun,
  rows,
  saveAction,
  deleteAction,
}: {
  title: string;
  noun: string;
  rows: Row[];
  saveAction: Action;
  deleteAction: Action;
}) {
  return (
    <section className="rounded-md border border-[var(--ink-faint)] bg-paper p-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <ul className="mt-3 divide-y divide-[var(--ink-faint)]">
        {rows.map((row) => (
          <RowItem
            key={row.slug}
            row={row}
            noun={noun}
            saveAction={saveAction}
            deleteAction={deleteAction}
          />
        ))}
      </ul>

      <AddForm noun={noun} saveAction={saveAction} />
    </section>
  );
}

function RowItem({
  row,
  noun,
  saveAction,
  deleteAction,
}: {
  row: Row;
  noun: string;
  saveAction: Action;
  deleteAction: Action;
}) {
  const [saveState, save, saving] = useActionState(saveAction, null);
  const [delState, del, deleting] = useActionState(deleteAction, null);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-end gap-2">
        <form id={`edit-${row.slug}`} action={save} className="contents">
          <input type="hidden" name="slug" value={row.slug} />
          <label className="min-w-[8rem] flex-1">
            <span className="mb-0.5 block text-xs font-medium text-ink-soft">
              Name (English)
            </span>
            <input name="name_en" defaultValue={row.name_en} required className={inputCls} />
          </label>
          <label className="min-w-[8rem] flex-1">
            <span className="mb-0.5 block text-xs font-medium text-ink-soft">
              Name (Nepali)
            </span>
            <NepaliInput name="name_ne" defaultValue={row.name_ne ?? ""} className={inputCls} />
          </label>
          <label className="flex min-h-11 items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={row.active}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Shown
          </label>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-sm border-[1.5px] border-ink px-3 text-sm font-medium hover:bg-paper-shade disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>

        {/* Sibling delete form — never nested inside the edit form */}
        <form action={del}>
          <input type="hidden" name="slug" value={row.slug} />
          <ConfirmSubmit
            message={`Delete "${row.name_en}"? This ${noun} must not be in use.`}
            className="min-h-11 rounded-sm border-[1.5px] border-outofstock px-3 text-sm font-medium text-outofstock hover:bg-paper-shade disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </ConfirmSubmit>
        </form>
      </div>

      <span className="mt-1 block text-xs text-ink-soft">id: {row.slug}</span>
      {saveState?.error ? (
        <p role="alert" className="mt-1 text-sm font-medium text-outofstock">
          {saveState.error}
        </p>
      ) : null}
      {delState?.error ? (
        <p role="alert" className="mt-1 text-sm font-medium text-outofstock">
          {delState.error}
        </p>
      ) : null}
    </li>
  );
}

function AddForm({ noun, saveAction }: { noun: string; saveAction: Action }) {
  const [state, action, pending] = useActionState(saveAction, null);

  return (
    <form
      action={action}
      className="mt-4 flex flex-wrap items-end gap-2 border-t border-dashed border-[var(--ink-faint)] pt-4"
    >
      <label className="min-w-[8rem] flex-1">
        <span className="mb-0.5 block text-xs font-medium text-ink-soft">
          New {noun} — name (English)
        </span>
        <input name="name_en" required placeholder="e.g. Poster colours" className={inputCls} />
      </label>
      <label className="min-w-[8rem] flex-1">
        <span className="mb-0.5 block text-xs font-medium text-ink-soft">
          Name (Nepali) — optional
        </span>
        <NepaliInput name="name_ne" className={inputCls} />
      </label>
      {/* New rows are shown by default */}
      <input type="hidden" name="active" value="on" />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-sm border border-accent-deep bg-accent px-4 text-sm font-medium text-paper hover:bg-accent-deep disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state?.error ? (
        <p role="alert" className="w-full text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
