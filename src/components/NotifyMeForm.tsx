"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { normalizeNepaliMobile } from "@/lib/phone";

/**
 * Inline "notify me when it arrives" form for out-of-stock books.
 * Collapsed to a single button; expands to a phone input; posts to
 * /api/notify. Confirmation copy sets the expectation that the owner
 * replies on WhatsApp (that loop closes in the Phase 4 waiting list).
 */

type Status = "closed" | "open" | "sending" | "done";

export default function NotifyMeForm({ bookId }: { bookId: string }) {
  const t = useTranslations("books");
  const [status, setStatus] = useState<Status>("closed");
  const [error, setError] = useState<string | null>(null);

  if (status === "done") {
    return (
      <p role="status" className="mt-3 text-sm font-medium text-instock">
        {t("notifyDone")}
      </p>
    );
  }

  if (status === "closed") {
    return (
      <button
        type="button"
        onClick={() => setStatus("open")}
        className="mt-3 inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-dashed border-ink-soft px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
      >
        {t("notifyButton")}
      </button>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("phone") ?? "");
    const phone = normalizeNepaliMobile(raw);
    if (!phone) {
      setError(t("notifyInvalid"));
      return;
    }

    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, phone }),
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      setError(t(res.status === 429 ? "notifyRateLimited" : "notifyError"));
      setStatus("open");
    } catch {
      setError(t("notifyError"));
      setStatus("open");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-3">
      <label className="block max-w-xs">
        <span className="mb-1 block text-sm font-medium">{t("notifyPhoneLabel")}</span>
        <div className="flex gap-2">
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoFocus
            required
            placeholder={t("notifyPhonePlaceholder")}
            className="w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/60 focus-visible:border-ink"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm border border-accent-deep bg-accent px-4 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep disabled:opacity-60"
          >
            {t(status === "sending" ? "notifySending" : "notifySubmit")}
          </button>
        </div>
      </label>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-outofstock">
          {error}
        </p>
      ) : null}
    </form>
  );
}
