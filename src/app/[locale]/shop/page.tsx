import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AskInstead from "@/components/AskInstead";
import Container from "@/components/Container";
import InquireLink from "@/components/InquireLink";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/inquiry";
import { categoryLabel, getProductCategories } from "@/lib/product-categories";
import {
  DEFAULT_PRODUCT_KIND,
  PRODUCT_KINDS,
  toProductKind,
} from "@/lib/product-kinds";
import { getProducts, productName } from "@/lib/products";
import type { ProductKind } from "@/lib/supabase/types";

/**
 * The showcase wall: stationery and sports items, one kind at a time behind
 * notebook-divider tabs. Both kinds are the same `products` table (migration
 * 0012) and the same taped-print card — only the category chips change.
 *
 * The kind lives in `?kind=`, not in the path, so the tabs, the chips and the
 * Look-for-Book-style `scroll={false}` in-place updates are all plain links:
 * no client JS, and every view is a shareable URL.
 */

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

/** Canonical URL for a kind — the default one keeps the bare /shop path. */
const kindHref = (kind: ProductKind) =>
  ({
    pathname: "/shop" as const,
    query: kind === DEFAULT_PRODUCT_KIND ? {} : { kind },
  });

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const kind = toProductKind(first((await searchParams).kind));
  const t = await getTranslations({ locale, namespace: "meta.shop" });
  const suffix = kind === DEFAULT_PRODUCT_KIND ? "" : `?kind=${kind}`;
  return {
    title: t(`${kind}.title`),
    description: t(`${kind}.description`),
    alternates: {
      canonical: `/${locale}/shop${suffix}`,
      languages: { en: `/en/shop${suffix}`, ne: `/ne/shop${suffix}` },
    },
  };
}

const chipBase =
  "inline-flex min-h-9 items-center whitespace-nowrap rounded-sm border-[1.5px] px-3 py-1 " +
  "text-sm font-medium transition-[scale,color,background-color,border-color] " +
  "duration-[var(--dur-micro)] motion-safe:active:scale-95";
const chipOn = `${chipBase} border-ink bg-ink text-paper`;
const chipOff = `${chipBase} border-[var(--ink-faint)] bg-paper text-ink hover:bg-paper-shade`;

const tabBase =
  "-mb-0.5 inline-flex min-h-11 shrink-0 items-center rounded-t-md border-2 border-b-0 px-4 pt-2 pb-1.5 " +
  "font-medium no-underline transition-[color,background-color,translate] duration-[var(--dur-micro)] ease-soft";
const tabOn = `${tabBase} border-[var(--ink-faint)] bg-paper text-accent`;
const tabOff = `${tabBase} border-transparent bg-paper-shade text-ink-soft hover:text-ink motion-safe:hover:-translate-y-0.5`;

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "shop" });

  const query = await searchParams;
  const kind = toProductKind(first(query.kind));

  const all = await getProducts();
  const offline = all === null;
  const products = (all ?? []).filter((p) => p.kind === kind);

  // Admin-managed categories for this kind; a slug→row map + `sort` order.
  const categories = await getProductCategories(kind, true);
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const categoryParam = first(query.category).trim();
  const selectedCategory = catBySlug.has(categoryParam) ? categoryParam : null;

  // Chips only for categories that actually have items (same rule as the book
  // genre chips); an empty category can't be reached from the UI.
  const presentCategories = categories.filter((c) =>
    products.some((p) => p.category === c.slug),
  );

  // "All" groups by the managed category order, then name; a selected category
  // just filters. Either way created_at-desc from the query is the tiebreak.
  const catIndex = new Map(categories.map((c, i) => [c.slug, i]));
  const results = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : [...products].sort(
        (a, b) =>
          (catIndex.get(a.category) ?? 0) - (catIndex.get(b.category) ?? 0) ||
          productName(a, locale).localeCompare(productName(b, locale)),
      );

  // WhatsApp fallback text: the category label when one is picked, else the
  // name of the open tab ("Sports").
  const fallbackQuery = selectedCategory
    ? categoryLabel(catBySlug.get(selectedCategory)!, locale)
    : t(`kinds.${kind}`);

  return (
    <Container className="py-12">
      <Reveal>
        <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
      </Reveal>

      {/* Kind tabs — notebook dividers, one shelf at a time */}
      <nav
        aria-label={t("kindLabel")}
        className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-b-2 border-[var(--ink-faint)] px-4 sm:mx-0 sm:px-0"
      >
        {PRODUCT_KINDS.map((k) => {
          const count = all?.filter((p) => p.kind === k).length;
          return (
            <Link
              key={k}
              scroll={false}
              href={kindHref(k)}
              aria-current={k === kind ? "page" : undefined}
              className={k === kind ? tabOn : tabOff}
            >
              {t(`kinds.${k}`)}
              {count ? (
                <span className="ml-1.5 text-xs font-normal tabular-nums opacity-70">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Panel — keyed on the kind so its entrance replays when tabs change */}
      <div key={kind}>
        <p className="mt-5 max-w-prose text-ink-soft">{t(`intro.${kind}`)}</p>

        {presentCategories.length > 1 ? (
          <nav aria-label={t("categoryLabel")} className="mt-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
              {t("categoryLabel")}
            </p>
            <ul className="flex items-stretch gap-2 overflow-x-auto pb-2">
              <li>
                <Link
                  scroll={false}
                  href={kindHref(kind)}
                  className={selectedCategory ? chipOff : chipOn}
                >
                  {t("allCategories")}
                </Link>
              </li>
              {presentCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    scroll={false}
                    href={{
                      pathname: "/shop",
                      query:
                        kind === DEFAULT_PRODUCT_KIND
                          ? { category: c.slug }
                          : { kind, category: c.slug },
                    }}
                    className={selectedCategory === c.slug ? chipOn : chipOff}
                  >
                    {categoryLabel(c, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {offline ? (
          <AskInstead
            heading={t("offline")}
            cta={t("askCta")}
            message={t("waTemplate", { query: fallbackQuery })}
            query={fallbackQuery}
          />
        ) : results.length === 0 ? (
          <AskInstead
            heading={t("empty")}
            cta={t("askCta")}
            message={t("waTemplate", { query: fallbackQuery })}
            query={fallbackQuery}
          />
        ) : (
          <section className="mt-6">
            <p role="status" className="text-sm font-medium text-ink-soft">
              {t("resultsCount", { count: results.length })}
            </p>
            {/* pt-3 + gap-y-7 keep the tape overhang from being clipped — do NOT
                wrap the grid (or any ancestor of a card) in overflow-hidden. */}
            <Reveal
              as="ul"
              stagger
              className="reveal-brisk mt-3 grid grid-cols-2 gap-x-3 gap-y-7 pt-3 sm:grid-cols-3 lg:grid-cols-4"
            >
              {results.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </Reveal>
            {/* Never a dead end — ask for anything not on the wall */}
            <p className="mt-8 text-sm text-ink-soft">
              {t("askMore")}{" "}
              <InquireLink
                href={waLink(t("waTemplate", { query: fallbackQuery }))}
                title={fallbackQuery}
                source="results_footer"
                className="font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
              >
                {t("askCta")}
              </InquireLink>
            </p>
          </section>
        )}
      </div>
    </Container>
  );
}
