import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BookCard from "@/components/BookCard";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { Link } from "@/i18n/navigation";
import { className, getBooks, getClasses } from "@/lib/books";
import { GENRES, isGenre } from "@/lib/genres";
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
  class?: number | "other" | null;
  subject?: string;
  q?: string;
  stream?: string;
  genre?: string;
}) {
  const query: Record<string, string> = {};
  if (next.class) query.class = String(next.class);
  if (next.subject) query.subject = next.subject;
  if (next.q) query.q = next.q;
  if (next.stream) query.stream = next.stream;
  if (next.genre) query.genre = next.genre;
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
  const classParam = first(sp.class);
  // "other" = the non-school shelf (novels, religious, children's books).
  const otherSelected = classParam === "other";
  const classIdParam = Number.parseInt(classParam, 10);
  const selectedClass = classes?.find((c) => c.id === classIdParam) ?? null;
  const classSel = otherSelected ? ("other" as const) : (selectedClass?.id ?? null);

  const hasFilter = Boolean(selectedClass || otherSelected || q);
  const books = classes && hasFilter ? await getBooks(classSel, q || null) : [];
  const offline = classes === null || books === null;

  // Stream filter — class 11/12 only. Default "all streams"; an individual
  // stream also includes books common to every stream (stream = null).
  const hasStreams = Boolean(selectedClass && STREAM_CLASS_IDS.has(selectedClass.id));
  const streamParam = first(sp.stream).trim();
  const selectedStream = hasStreams && isStream(streamParam) ? streamParam : "";

  // Genre filter — the "other" shelf only; chips appear for genres in stock.
  const genres = otherSelected
    ? GENRES.filter((g) => books?.some((b) => b.genre === g))
    : [];
  const genreParam = first(sp.genre).trim();
  const selectedGenre = otherSelected && isGenre(genreParam) ? genreParam : "";

  const subjects =
    selectedClass && books?.length
      ? [...new Set(books.map((b) => b.subject))].sort((a, b) => a.localeCompare(b))
      : [];
  const selectedSubject = subjects.includes(subjectParam) ? subjectParam : "";
  const results = (books ?? []).filter(
    (b) =>
      (!selectedSubject || b.subject === selectedSubject) &&
      (!selectedStream || b.stream === null || b.stream === selectedStream) &&
      (!selectedGenre || b.genre === selectedGenre)
  );

  const classLabelById = new Map(classes?.map((c) => [c.id, className(c, locale)]));
  /** Card badge + WhatsApp text: class for textbooks, genre for the rest. */
  const bookLabel = (book: Book) =>
    book.class_id !== null
      ? classLabelById.get(book.class_id) ?? ""
      : t(`genres.${book.genre ?? "other"}`);
  const fallbackQuery =
    q ||
    [
      selectedClass ? className(selectedClass, locale) : "",
      selectedGenre ? t(`genres.${selectedGenre}`) : otherSelected ? t("otherBooks") : "",
      selectedSubject,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <Container className="py-12">
      <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
      <p className="max-w-prose text-ink-soft">{t("intro")}</p>

      {/* The school's official list — a paper slip above the filters */}
      <Link
        href="/books/list"
        className="group mt-5 flex max-w-xl items-center justify-between gap-3 rounded-md border-[1.5px] border-[var(--ink-faint)] bg-paper-shade/50 px-4 py-3 no-underline shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-ink"
      >
        <span>
          <span className="block font-semibold text-ink transition-colors duration-150 group-hover:text-accent">
            {t("list.button")}
          </span>
          <span className="mt-0.5 block text-sm text-ink-soft">{t("list.hint")}</span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-xl text-ink-soft transition-colors duration-150 group-hover:text-accent"
        >
          →
        </span>
      </Link>

      {/* Class chips — horizontal scroll on mobile */}
      {classes ? (
        <nav aria-label={t("classLabel")} className="mt-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {t("classLabel")}
          </p>
          <ul className="flex items-stretch gap-2 overflow-x-auto pb-2">
            <li>
              <Link
                href={filters({ q })}
                className={selectedClass || otherSelected ? chipOff : chipOn}
              >
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
            {/* The non-school shelf sits after a rule — same row, its own drawer */}
            <li aria-hidden="true" className="w-px shrink-0 self-stretch bg-[var(--ink-faint)]" />
            <li>
              <Link
                href={filters({ class: "other", q })}
                className={otherSelected ? chipOn : chipOff}
              >
                {t("otherBooks")}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}

      {/* Search — plain GET form, works without JS */}
      <form action={`/${locale}/books`} method="get" className="mt-4 flex max-w-xl gap-2">
        {selectedClass || otherSelected ? (
          <input type="hidden" name="class" value={otherSelected ? "other" : selectedClass!.id} />
        ) : null}
        {selectedStream ? <input type="hidden" name="stream" value={selectedStream} /> : null}
        {selectedGenre ? <input type="hidden" name="genre" value={selectedGenre} /> : null}
        <label htmlFor="book-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id="book-search"
          name="q"
          type="search"
          key={q} // remount on navigation so the box always shows the active search
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

      {/* Active-search token — the input's native ✕ only clears the box, not the
          URL, so give the real filter a visible one-click way out */}
      {q ? (
        <p className="mt-2 text-sm text-ink-soft">
          {t("activeSearch", { query: q })}{" "}
          <Link
            href={filters({
              class: otherSelected ? "other" : selectedClass?.id,
              subject: selectedSubject,
              stream: selectedStream,
              genre: selectedGenre,
            })}
            className="font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
          >
            {t("clearSearch")}
          </Link>
        </p>
      ) : null}

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

      {/* Genre chips — the "other" shelf only; just the genres in stock */}
      {genres.length > 1 ? (
        <nav aria-label={t("genreLabel")} className="mt-4">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {t("genreLabel")}
          </p>
          <ul className="flex gap-2 overflow-x-auto pb-2">
            <li>
              <Link
                href={filters({ class: "other", q })}
                className={selectedGenre ? chipOff : chipOn}
              >
                {t("allGenres")}
              </Link>
            </li>
            {genres.map((g) => (
              <li key={g}>
                <Link
                  href={filters({ class: "other", q, genre: g })}
                  className={selectedGenre === g ? chipOn : chipOff}
                >
                  {t(`genres.${g}`)}
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
              <BookCard key={book.id} book={book} classLabel={bookLabel(book)} />
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
