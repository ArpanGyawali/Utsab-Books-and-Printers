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
import { categoryLabel, getStationeryCategories } from "@/lib/product-categories";
import { getProducts, productName } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.stationery" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/stationery`,
      languages: { en: "/en/stationery", ne: "/ne/stationery" },
    },
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

const chipBase =
  "inline-flex min-h-9 items-center whitespace-nowrap rounded-sm border-[1.5px] px-3 py-1 " +
  "text-sm font-medium transition-[scale,color,background-color,border-color] " +
  "duration-[var(--dur-micro)] motion-safe:active:scale-95";
const chipOn = `${chipBase} border-ink bg-ink text-paper`;
const chipOff = `${chipBase} border-[var(--ink-faint)] bg-paper text-ink hover:bg-paper-shade`;

export default async function StationeryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "stationery" });

  const products = await getProducts();
  const offline = products === null;

  // Admin-managed categories; a slug→row map + display order from `sort`.
  const categories = await getStationeryCategories(true);
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const categoryParam = first((await searchParams).category).trim();
  const selectedCategory = catBySlug.has(categoryParam) ? categoryParam : null;

  // Chips only for categories that actually have items (same rule as the
  // book genre chips); the whole list drives them so an empty category can't
  // be reached from the UI.
  const presentCategories = categories.filter((c) =>
    products?.some((p) => p.category === c.slug),
  );

  // "All" groups by the managed category order, then name; a selected category
  // just filters. Either way created_at-desc from the query is the tiebreak.
  const catIndex = new Map(categories.map((c, i) => [c.slug, i]));
  const results = selectedCategory
    ? (products ?? []).filter((p) => p.category === selectedCategory)
    : [...(products ?? [])].sort(
        (a, b) =>
          (catIndex.get(a.category) ?? 0) - (catIndex.get(b.category) ?? 0) ||
          productName(a, locale).localeCompare(productName(b, locale)),
      );

  // WhatsApp fallback text: the category label when one is picked, else generic.
  const fallbackQuery = selectedCategory
    ? categoryLabel(catBySlug.get(selectedCategory)!, locale)
    : t("title");

  return (
    <Container className="py-12">
      <Reveal>
        <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
        <p className="max-w-prose text-ink-soft">{t("intro")}</p>
      </Reveal>

      {/* Category chips — horizontal scroll on mobile */}
      {presentCategories.length > 1 ? (
        <nav aria-label={t("categoryLabel")} className="mt-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {t("categoryLabel")}
          </p>
          <ul className="flex items-stretch gap-2 overflow-x-auto pb-2">
            <li>
              <Link
                scroll={false}
                href={{ pathname: "/stationery", query: {} }}
                className={selectedCategory ? chipOff : chipOn}
              >
                {t("allCategories")}
              </Link>
            </li>
            {presentCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  scroll={false}
                  href={{ pathname: "/stationery", query: { category: c.slug } }}
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
    </Container>
  );
}
