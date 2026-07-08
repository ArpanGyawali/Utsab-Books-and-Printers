import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BookCard from "@/components/BookCard";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { Link } from "@/i18n/navigation";
import { className, getBooks, getClasses } from "@/lib/books";
import { waLink } from "@/lib/inquiry";
import { isStream, STREAM_CLASS_IDS, STREAMS } from "@/lib/streams";
import type { Book } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.books" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/books`,
      languages: { en: "/en/books", ne: "/ne/books" },
    },
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const chipBase =
  "inline-flex min-h-9 items-center whitespace-nowrap rounded-sm border-[1.5px] px-3 py-1 " +
  "text-sm font-medium transition-colors duration-150";
const chipOn = `${chipBase} border-ink bg-ink text-paper`;
const chipOff = `${chipBase} border-[var(--ink-faint)] bg-paper text-ink hover:bg-paper-shade`;

/** Query object for a filter link — omits empty values so URLs stay clean. */
function filters(next: {
  class?: number | null;
  subject?: string;
  q?: string;
  stream?: string;
}) {
  const query: Record<string, string> = {};
  if (next.class) query.class = String(next.class);
  if (next.subject) query.subject = next.subject;
  if (next.q) query.q = next.q;
  if (next.stream) query.stream = next.stream;
  return { pathname: "/books", query };
}

export default async function BooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "books" });

  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 60);
  const subjectParam = first(sp.subject).trim();

  const classes = await getClasses();
  const classIdParam = Number.parseInt(first(sp.class), 10);
  const selectedClass = classes?.find((c) => c.id === classIdParam) ?? null;

  const hasFilter = Boolean(selectedClass || q);
  const books = classes && hasFilter ? await getBooks(selectedClass?.id ?? null, q || null) : [];
  const offline = classes === null || books === null;

  // Stream filter — class 11/12 only. Default "all streams"; an individual
  // stream also includes books common to every stream (stream = null).
  const hasStreams = Boolean(selectedClass && STREAM_CLASS_IDS.has(selectedClass.id));
  const streamParam = first(sp.stream).trim();
  const selectedStream = hasStreams && isStream(streamParam) ? streamParam : "";

  const subjects =
    selectedClass && books?.length
      ? [...new Set(books.map((b) => b.subject))].sort((a, b) => a.localeCompare(b))
      : [];
  const selectedSubject = subjects.includes(subjectParam) ? subjectParam : "";
  const results = (books ?? []).filter(
    (b) =>
      (!selectedSubject || b.subject === selectedSubject) &&
      (!selectedStream || b.stream === null || b.stream === selectedStream)
  );

  const classLabelById = new Map(classes?.map((c) => [c.id, className(c, locale)]));
  const fallbackQuery =
    q || [selectedClass ? className(selectedClass, locale) : "", selectedSubject].filter(Boolean).join(" · ");

  return (
    <Container className="py-12">
      <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
      <p className="max-w-prose text-ink-soft">{t("intro")}</p>

      {/* Class chips — horizontal scroll on mobile */}
      {classes ? (
        <nav aria-label={t("classLabel")} className="mt-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {t("classLabel")}
          </p>
          <ul className="flex gap-2 overflow-x-auto pb-2">
            <li>
              <Link href={filters({ q })} className={selectedClass ? chipOff : chipOn}>
                {t("allClasses")}
              </Link>
            </li>
            {classes.map((c) => (
              <li key={c.id}>
                <Link
                  href={filters({ class: c.id, q })}
                  className={selectedClass?.id === c.id ? chipOn : chipOff}
                >
                  {className(c, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {/* Search — plain GET form, works without JS */}
      <form action={`/${locale}/books`} method="get" className="mt-4 flex max-w-xl gap-2">
        {selectedClass ? <input type="hidden" name="class" value={selectedClass.id} /> : null}
        {selectedStream ? <input type="hidden" name="stream" value={selectedStream} /> : null}
        <label htmlFor="book-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id="book-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 text-ink placeholder:text-ink-soft/60 focus-visible:border-ink"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm border border-accent-deep bg-accent px-5 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
        >
          {t("searchSubmit")}
        </button>
      </form>

      {/* Stream chips — only for class 11/12; "all streams" is the default */}
      {hasStreams ? (
        <nav aria-label={t("streamLabel")} className="mt-4">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {t("streamLabel")}
          </p>
          <ul className="flex gap-2 overflow-x-auto pb-2">
            <li>
              <Link
                href={filters({ class: selectedClass?.id, subject: selectedSubject, q })}
                className={selectedStream ? chipOff : chipOn}
              >
                {t("allStreams")}
              </Link>
            </li>
            {STREAMS.map((s) => (
              <li key={s}>
                <Link
                  href={filters({
                    class: selectedClass?.id,
                    subject: selectedSubject,
                    q,
                    stream: s,
                  })}
                  className={selectedStream === s ? chipOn : chipOff}
                >
                  {t(`streams.${s}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {/* Subject chips for the selected class */}
      {subjects.length > 1 ? (
        <nav aria-label={t("subjectLabel")} className="mt-4">
          <ul className="flex gap-2 overflow-x-auto pb-2">
            <li>
              <Link
                href={filters({ class: selectedClass?.id, q, stream: selectedStream })}
                className={selectedSubject ? chipOff : chipOn}
              >
                {t("allSubjects")}
              </Link>
            </li>
            {subjects.map((s) => (
              <li key={s}>
                <Link
                  href={filters({ class: selectedClass?.id, subject: s, q, stream: selectedStream })}
                  className={selectedSubject === s ? chipOn : chipOff}
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {offline ? (
        <AskInstead heading={t("offline")} cta={t("noResultsCta")} message={t("noResultsWaTemplate", { query: fallbackQuery || "…" })} />
      ) : !hasFilter ? (
        <p className="mt-10 rounded-md border-[1.5px] border-dashed border-[var(--ink-faint)] p-6 text-center text-ink-soft">
          {t("promptEmpty")}
        </p>
      ) : results.length === 0 ? (
        <AskInstead heading={t("noResults")} cta={t("noResultsCta")} message={t("noResultsWaTemplate", { query: fallbackQuery })} />
      ) : (
        <section className="mt-8">
          <p role="status" className="text-sm font-medium text-ink-soft">
            {t("resultsCount", { count: results.length })}
          </p>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">
            {results.map((book: Book) => (
              <BookCard
                key={book.id}
                book={book}
                classLabel={classLabelById.get(book.class_id) ?? ""}
              />
            ))}
          </ul>
          {/* Never a dead end — generic escape hatch under every result list */}
          <p className="mt-8 text-sm text-ink-soft">
            {t("noResults")}{" "}
            <a
              href={waLink(t("noResultsWaTemplate", { query: fallbackQuery }))}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
            >
              {t("noResultsCta")}
            </a>
          </p>
        </section>
      )}
    </Container>
  );
}

function AskInstead({ heading, cta, message }: { heading: string; cta: string; message: string }) {
  return (
    <div className="mt-10 rounded-md border-[1.5px] border-dashed border-[var(--ink-faint)] p-6 text-center">
      <p className="text-ink-soft">{heading}</p>
      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-5 py-2 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
      >
        {cta}
      </a>
    </div>
  );
}
