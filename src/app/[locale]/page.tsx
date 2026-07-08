import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import BannerStrip from "@/components/BannerStrip";
import Button from "@/components/Button";
import Container from "@/components/Container";
import RuledDivider from "@/components/RuledDivider";
import SectionHeading from "@/components/SectionHeading";
import StampLogo from "@/components/StampLogo";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { Link } from "@/i18n/navigation";
import { localizedEstablishedYear, type WeekHours } from "@/lib/site";
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
  const locale = useLocale();
  // 2021 A.D. in English, 2078 B.S. in Nepali — same opening day.
  const establishedYear = localizedEstablishedYear(locale);

  return (
    <>
      <LocalBusinessJsonLd hours={hours} />

      {/* Hero — full-bleed shop-front photo with ink overlay. The section
          follows the photo's own aspect ratio (2400×1773) so the storefront
          isn't cropped; it only grows past that when the overlaid content
          needs more room (narrow phones), and is capped on tall viewports. */}
      <section className="relative isolate flex aspect-[2400/1773] max-h-[85vh] w-full items-center justify-center overflow-hidden">
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
            {tBrand("since", { year: establishedYear })}
          </p>
        </Container>
      </section>

      <BannerStrip />

      {/* Shop story — the owners, in their own words. */}
      <Container className="py-12">
        <div className="grid items-center gap-8 sm:grid-cols-[3fr_2fr]">
          <div>
            <SectionHeading
              kicker={tHome("storyKicker", { year: establishedYear })}
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
          {/* Two prints laid on the counter: the portrait (3:4) tilted left,
              the landscape (4:3) overlapping from the right — both at their
              native aspect ratios, so nothing is cropped. */}
          <div className="mx-auto w-full max-w-sm py-3 sm:max-w-none">
            <figure className="w-[70%] -rotate-2 rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-6 shadow-[var(--shadow-card)]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/owner2.jpg"
                  alt={tHome("ownerDeskAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 70vw, 28vw"
                />
              </div>
            </figure>
            <figure className="relative z-10 -mt-[22%] ml-auto w-[85%] rotate-[1.5deg] rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-6 shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/owner1.jpg"
                  alt={tHome("ownerCounterAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 85vw, 34vw"
                />
              </div>
            </figure>
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
