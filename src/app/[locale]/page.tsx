import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import BannerStrip from "@/components/BannerStrip";
import Button from "@/components/Button";
import Container from "@/components/Container";
import RuledDivider from "@/components/RuledDivider";
import SectionHeading from "@/components/SectionHeading";
import StampLogo from "@/components/StampLogo";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { Link } from "@/i18n/navigation";
import { site, type WeekHours } from "@/lib/site";
import { getShopHours } from "@/lib/settings";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const hours = await getShopHours();
  return <HomeContent hours={hours} />;
}

const exploreLinks = [
  { href: "/services", key: "services" },
  { href: "/books", key: "books" },
  { href: "/contact", key: "contact" },
] as const;

function HomeContent({ hours }: { hours: WeekHours }) {
  const t = useTranslations("hero");
  const tBrand = useTranslations("brand");
  const tHome = useTranslations("home");

  return (
    <>
      <LocalBusinessJsonLd hours={hours} />

      {/* Hero — full-bleed shop-front photo with ink overlay. */}
      <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/storefront.jpg"
          alt={t("photoAlt")}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_62%,transparent)]"
        />
        <Container className="relative z-10 flex flex-col items-center gap-6 py-16 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-paper-shade">
            {t("kicker")}
          </p>
          <StampLogo size="lg" className="bg-paper" />
          <h1 className="max-w-2xl text-3xl font-semibold text-paper sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-paper-shade">
            {t("subtitle")}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button href="/books">{t("ctaBooks")}</Button>
            <Button
              href="/services"
              variant="secondary"
              className="border-paper text-paper hover:bg-[color-mix(in_srgb,var(--paper)_15%,transparent)]"
            >
              {t("ctaServices")}
            </Button>
          </div>
          <p className="text-sm text-paper-shade">
            {tBrand("since", { year: site.establishedYear })}
          </p>
        </Container>
      </section>

      <BannerStrip />

      {/* Shop story — the owners, in their own words. */}
      <Container className="py-12">
        <div className="grid items-center gap-8 sm:grid-cols-[3fr_2fr]">
          <div>
            <SectionHeading
              kicker={tHome("storyKicker", { year: site.establishedYear })}
            >
              {tHome("storyHeading")}
            </SectionHeading>
            <p className="max-w-prose leading-relaxed text-ink-soft">
              {tHome("story")}
            </p>
            <p className="mt-3 font-medium text-ink">{tHome("storyNote")}</p>
            <p className="mx-auto mt-8 max-w-xl text-center text-lg italic text-ink-soft sm:text-left">
              {tBrand("tagline")}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md shadow-[var(--shadow-card)]">
              <Image
                src="/images/owner2.jpg"
                alt={tHome("ownerDeskAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 40vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md shadow-[var(--shadow-card)]">
              <Image
                src="/images/owner1.jpg"
                alt={tHome("ownerCounterAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </Container>

      <RuledDivider />

      {/* Quick links — the same three destinations as the navbar, so visitors
          who scrolled past it still land somewhere useful. */}
      <Container className="py-12">
        <SectionHeading kicker={tHome("explore.kicker")}>
          {tHome("explore.heading")}
        </SectionHeading>
        <ul className="max-w-2xl divide-y divide-[var(--ink-faint)] border-y border-[var(--ink-faint)]">
          {exploreLinks.map(({ href, key }) => (
            <li key={key}>
              <Link
                href={href}
                className="group flex items-center justify-between gap-4 py-4 no-underline"
              >
                <span>
                  <span className="block text-lg font-semibold text-ink transition-colors duration-150 group-hover:text-accent">
                    {tHome(`explore.${key}.title`)}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    {tHome(`explore.${key}.line`)}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl text-ink-soft transition-colors duration-150 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
