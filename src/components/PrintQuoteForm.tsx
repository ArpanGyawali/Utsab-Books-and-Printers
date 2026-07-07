"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "./Button";
import { waLink } from "@/lib/inquiry";

/**
 * Print-quote form. Phase 2: composes a WhatsApp message only.
 * Phase 4 additionally stores the quote in `print_quotes` before handoff.
 */

/** Normalize Devanagari numerals (०-९ → 0-9) per SKILL.md i18n rules. */
function normalizeDigits(value: string): string {
  return value.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
}

const inputCls =
  "w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 " +
  "text-ink placeholder:text-ink-soft/60 focus-visible:border-ink";

export default function PrintQuoteForm() {
  const t = useTranslations("services.quote");
  const [error, setError] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = normalizeDigits(String(data.get("phone") ?? "").trim());
    const description = String(data.get("description") ?? "").trim();

    if (!name || !phone || !description) {
      setError(true);
      return;
    }
    setError(false);

    const bindingKey = String(data.get("binding") ?? "none");
    const binding = t(
      bindingKey === "spiral"
        ? "bindingSpiral"
        : bindingKey === "book"
          ? "bindingBook"
          : "bindingNone"
    );

    window.open(
      waLink(t("waTemplate", { name, phone, description, binding })),
      "_blank",
      "noopener"
    );
  }

  return (
    <section className="mt-10 rounded-md border border-[var(--ink-faint)] bg-paper-shade/60 p-5 sm:p-6">
      <h3 className="text-xl font-semibold">{t("heading")}</h3>
      <p className="mt-1 text-sm text-ink-soft">{t("sub")}</p>

      <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t("name")}</span>
          <input name="name" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t("phone")}</span>
          <input name="phone" type="tel" inputMode="tel" required className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">{t("description")}</span>
          <span className="mb-1.5 block text-xs text-ink-soft">{t("descriptionHint")}</span>
          <textarea
            name="description"
            rows={3}
            required
            placeholder={t("descriptionPlaceholder")}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t("binding")}</span>
          <select name="binding" className={inputCls}>
            <option value="none">{t("bindingNone")}</option>
            <option value="spiral">{t("bindingSpiral")}</option>
            <option value="book">{t("bindingBook")}</option>
          </select>
        </label>

        <div className="sm:col-span-2">
          <p className="mb-4 rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] bg-paper px-3 py-2.5 text-sm text-ink">
            {t("attachNote")}
          </p>
          {error ? (
            <p role="alert" className="mb-3 text-sm font-medium text-outofstock">
              {t("errRequired")}
            </p>
          ) : null}
          <Button type="submit">{t("submit")}</Button>
          <p className="mt-2 text-xs text-ink-soft">{t("hint")}</p>
        </div>
      </form>
    </section>
  );
}
