"use client";

import { useActionState } from "react";
import Button from "@/components/Button";
import {
  saveNotice,
  type SettingsState,
} from "@/app/admin/(panel)/settings/actions";
import type { LocalizedNotice } from "@/lib/settings";

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

/** Edit form for one localized notice (banner / closure notice). */
export default function NoticeForm({
  settingKey,
  heading,
  hint,
  initial,
}: {
  settingKey: "banner" | "closure_notice";
  heading: string;
  hint: string;
  initial: LocalizedNotice | null;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveNotice,
    null
  );

  return (
    <form
      action={formAction}
      className="rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)]"
    >
      <input type="hidden" name="key" value={settingKey} />
      <h2 className="font-semibold">{heading}</h2>
      <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>

      <label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial?.enabled ?? false}
          className="h-5 w-5 accent-[var(--accent)]"
        />
        Show on the website
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block text-sm font-medium">Text (Nepali)</span>
        <textarea
          name="text_ne"
          rows={2}
          defaultValue={initial?.text_ne ?? ""}
          className={inputCls}
        />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-medium">Text (English)</span>
        <textarea
          name="text_en"
          rows={2}
          defaultValue={initial?.text_en ?? ""}
          className={inputCls}
        />
      </label>

      {state && "error" in state ? (
        <p role="alert" className="mt-3 text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p className="mt-3 text-sm font-medium text-instock">Saved — the site is updated.</p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-3">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
