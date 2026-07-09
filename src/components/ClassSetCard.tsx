import { useTranslations } from "next-intl";
import InquireLink from "./InquireLink";
import { waLink } from "@/lib/inquiry";
import type { Book } from "@/lib/supabase/types";

/**
 * "Complete set" roll-up above the results when a class is chosen — the set
 * is derived from the class's rows, never stored. Total price appears only
 * when every book has one (a partial sum would read as the full price).
 */
export default function ClassSetCard({
  label,
  books,
}: {
  label: string;
  books: Book[];
}) {
  const t = useTranslations("books.set");

  const inStock = books.filter((b) => b.status === "in_stock").length;
  const arriving = books.filter((b) => b.status === "arriving").length;
  const allIn = inStock === books.length;
  const total = books.every((b) => b.price !== null)
    ? books.reduce((sum, b) => sum + Number(b.price), 0)
    : null;

  return (
    <aside className="mb-6 rounded-md border-[1.5px] border-ink bg-paper p-4 shadow-[var(--shadow-card)] sm:p-5">
      <h3 className="font-semibold leading-snug">{t("heading", { class: label })}</h3>
      <p className={`mt-1 text-sm font-medium ${allIn ? "text-instock" : "text-ink-soft"}`}>
        {allIn
          ? t("allIn", { count: books.length })
          : t("someIn", { inStock, count: books.length })}
        {!allIn && arriving > 0 ? ` · ${t("arrivingNote", { count: arriving })}` : null}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <InquireLink
          href={waLink(t("waTemplate", { class: label }))}
          title={label}
          source="class_set"
          className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-4 py-1.5 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
        >
          {t("cta")}
        </InquireLink>
        {total !== null ? (
          <p className="text-sm text-ink-soft">{t("totalApprox", { price: total })}</p>
        ) : null}
      </div>
    </aside>
  );
}
