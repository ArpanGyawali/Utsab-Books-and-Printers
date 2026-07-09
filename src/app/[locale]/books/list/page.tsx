import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/inquiry";
import { booklistFileUrl, getBooklist } from "@/lib/settings";

/**
 * The school/college's official book list, as posted by the owner in the
 * admin panel — typed text and/or a photo or PDF of the paper list.
 * Linked from the Look for Book page.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.booklist" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/books/list`,
      languages: { en: "/en/books/list", ne: "/ne/books/list" },
    },
  };
}

function formatUpdated(iso: string, locale: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  // Nepali month names, Arabic numerals (SKILL.md number rules).
  return new Intl.DateTimeFormat(locale === "ne" ? "ne-NP-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BooklistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "books.list" });

  const booklist = await getBooklist();
  const fileUrl = booklist ? booklistFileUrl(booklist) : null;
  const hasContent = Boolean(booklist && (booklist.text || fileUrl));
  const updated =
    booklist?.updated_at && hasContent ? formatUpdated(booklist.updated_at, locale) : null;

  return (
    <Container className="py-12">
      <p className="mb-4">
        <Link
          href="/books"
          className="text-sm font-medium text-ink-soft underline decoration-ink-soft/40 underline-offset-2 hover:text-ink"
        >
          ← {t("back")}
        </Link>
      </p>
      <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
      <p className="max-w-prose text-ink-soft">{t("intro")}</p>
      {updated ? (
        <p className="mt-2 text-sm font-medium uppercase tracking-widest text-accent">
          {t("updated", { date: updated })}
        </p>
      ) : null}

      {!hasContent ? (
        <div className="mt-10 max-w-xl rounded-md border-[1.5px] border-dashed border-[var(--ink-faint)] p-6 text-center">
          <p className="text-ink-soft">{t("empty")}</p>
          <a
            href={waLink(t("waTemplate"))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-5 py-2 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
          >
            {t("setCta")}
          </a>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl">
          {/* Typed list — a sheet pinned to the page, owner's own formatting */}
          {booklist?.text ? (
            <div className="rounded-md border border-[var(--ink-faint)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-7">
              <p className="whitespace-pre-wrap leading-relaxed">{booklist.text}</p>
            </div>
          ) : null}

          {/* Photo of the paper list, framed like the prints elsewhere */}
          {fileUrl && booklist?.file_type === "image" ? (
            <figure className="mt-6 rounded-sm border border-[var(--ink-faint)] bg-paper p-2 shadow-[var(--shadow-card)]">
              <Image
                src={fileUrl}
                alt={t("photoAlt")}
                width={booklist.file_w ?? 1200}
                height={booklist.file_h ?? 1600}
                className="h-auto w-full rounded-[1px]"
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </figure>
          ) : null}

          {fileUrl && booklist?.file_type === "pdf" ? (
            <p className="mt-6">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-5 py-2 font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
              >
                {t("openPdf")}
              </a>
            </p>
          ) : null}

          {/* The list always ends at the counter — full-set handoff */}
          <p className="mt-8">
            <a
              href={waLink(t("waTemplate"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-5 py-2 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
            >
              {t("setCta")}
            </a>
          </p>
        </div>
      )}
    </Container>
  );
}
