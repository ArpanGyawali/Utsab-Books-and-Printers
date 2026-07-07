import { useLocale, useTranslations } from "next-intl";
import Badge from "./Badge";
import NotifyMeForm from "./NotifyMeForm";
import { bookTitle } from "@/lib/books";
import { viberLink, waLink } from "@/lib/inquiry";
import type { Book } from "@/lib/supabase/types";

/** "20 July" / "जुलाई २०"-free: Nepali month names but Arabic numerals (SKILL.md). */
function formatArrival(dateStr: string, locale: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(locale === "ne" ? "ne-NP-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function BookCard({
  book,
  classLabel,
}: {
  book: Book;
  classLabel: string;
}) {
  const locale = useLocale();
  const t = useTranslations("books");
  const title = bookTitle(book, locale);
  const meta = [classLabel, book.subject, book.publisher].filter(Boolean).join(" · ");

  return (
    <li className="rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-snug">{title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{meta}</p>
        </div>
        <Badge status={book.status} className="mt-0.5 shrink-0" />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-semibold">
          {book.price !== null
            ? t("priceRs", { price: Number(book.price) })
            : t("priceAsk")}
        </p>
        {book.status === "in_stock" && book.units > 0 ? (
          <p className="text-sm text-ink-soft">{t("unitsLeft", { count: book.units })}</p>
        ) : null}
        {book.status === "arriving" && book.expected_arrival ? (
          <p className="text-sm font-medium text-arriving">
            {t("arrivingOn", { date: formatArrival(book.expected_arrival, locale) })}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={waLink(t("waTemplate", { title, class: classLabel }))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-4 py-1.5 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
        >
          {t("inquire")}
        </a>
        <a
          href={viberLink()}
          className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-4 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          {t("viber")}
        </a>
      </div>

      {book.status === "out_of_stock" ? <NotifyMeForm bookId={book.id} /> : null}
    </li>
  );
}
