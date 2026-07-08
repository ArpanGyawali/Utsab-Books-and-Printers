"use client";

import { useActionState } from "react";
import Button from "@/components/Button";
import {
  importAction,
  type ImportState,
} from "@/app/admin/(panel)/import/actions";

/**
 * CSV import flow: choose file → dry-run preview (nothing written) → commit.
 * The previewed CSV text rides along in a hidden field; the server re-parses
 * and re-validates it on commit.
 */

const idle: ImportState = { phase: "idle" };

export default function ImportPanel() {
  const [state, formAction, pending] = useActionState(importAction, idle);

  return (
    <div className="mt-5 grid gap-4">
      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="intent" value="preview" />
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-ink-soft file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[1.5px] file:border-solid file:border-ink file:bg-paper file:px-3 file:font-medium file:text-ink"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending && state.phase !== "preview"
            ? "Checking…"
            : "Check the file (nothing is saved yet)"}
        </Button>
      </form>

      {state.phase === "error" ? (
        <p role="alert" className="text-sm font-medium text-outofstock">
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <p className="rounded-sm border-[1.5px] border-dashed border-instock px-4 py-3 text-sm font-medium text-instock">
          Imported {state.imported} row(s). The public books page is already
          showing the new list.
        </p>
      ) : null}

      {state.phase === "preview" ? (
        <div className="rounded-md border border-[var(--ink-faint)] bg-paper-shade/60 p-4">
          <h2 className="font-semibold">What this file would do</h2>

          {state.preview.errors.length ? (
            <>
              <p role="alert" className="mt-2 text-sm font-medium text-outofstock">
                {state.preview.errors.length} problem(s) — fix the file and check
                again. Nothing was imported.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-ink-soft">
                {state.preview.errors.slice(0, 20).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <ul className="mt-2 grid gap-1 text-sm">
                <li>
                  <strong>{state.preview.inserts.length}</strong> new book(s)
                </li>
                <li>
                  <strong>{state.preview.updates.length}</strong> book(s) updated
                </li>
                <li>
                  <strong>{state.preview.unchangedCount}</strong> unchanged
                </li>
                {state.preview.missingCount > 0 ? (
                  <li className="text-ink-soft">
                    {state.preview.missingCount} book(s) currently on the site are
                    not in this file — they stay as they are (imports never delete).
                  </li>
                ) : null}
              </ul>

              {state.preview.inserts.length ? (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    New books ({state.preview.inserts.length})
                  </summary>
                  <ul className="mt-1 list-inside list-disc text-ink-soft">
                    {state.preview.inserts.slice(0, 100).map((r) => (
                      <li key={`${r.class}|${r.subject}|${r.title_en}`}>
                        {r.class} · {r.subject} · {r.title_en}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {state.preview.updates.length ? (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Updates ({state.preview.updates.length})
                  </summary>
                  <ul className="mt-1 grid list-inside list-disc gap-1 text-ink-soft">
                    {state.preview.updates.slice(0, 100).map((r) => (
                      <li key={`${r.class}|${r.subject}|${r.title_en}`}>
                        {r.class} · {r.title_en} — {r.changes.join("; ")}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              <form action={formAction} className="mt-4">
                <input type="hidden" name="intent" value="commit" />
                <input type="hidden" name="csv" value={state.csv} />
                <Button type="submit" disabled={pending}>
                  {pending ? "Importing…" : `Import ${state.preview.totalRows} row(s)`}
                </Button>
              </form>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
