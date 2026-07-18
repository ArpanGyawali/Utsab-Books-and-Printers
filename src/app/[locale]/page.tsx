import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import BannerStrip from "@/components/BannerStrip";
import Button from "@/components/Button";
import Container from "@/components/Container";
import RuledDivider from "@/components/RuledDivider";
import SectionHeading from "@/components/SectionHeading";
import ShopVideos from "@/components/ShopVideos";
import StampLogo from "@/components/StampLogo";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import Reveal from "@/components/motion/Reveal";
import SplitWords from "@/components/motion/SplitWords";
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

      {/* Hero — full-bleed shop-front photo with ink overlay. From sm up the
          section follows the photo's own aspect ratio (2400×1773, capped on
          tall viewports) so the storefront isn't cropped. On phones the
          content dictates the height — an aspect cap there would clip the
          overlaid title and buttons. */}
      <section className="relative isolate flex w-full items-center justify-center overflow-hidden sm:aspect-[2400/1773] sm:max-h-[85vh]">
        {/* .hero-drift/.hero-settle: gentle zoom-settle on load + few-px
            scroll drift (see styles/motion.css) */}
        <div className="hero-drift absolute inset-0">
          <Image
            src="/images/storefront.jpg"
            alt={t("photoAlt")}
            fill
            priority
            className="hero-settle object-cover"
            sizes="100vw"
          />
        </div>
        {/* Overlay dark enough to hold text over the bright sky in the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_74%,transparent)]"
        />
        <Container className="hero-cascade relative z-10 flex flex-col items-center gap-6 py-16 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-paper [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {t("kicker")}
          </p>
          <StampLogo size="lg" className="stamp-in bg-paper" />
          <h1 className="hero-title max-w-2xl text-3xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] sm:text-4xl">
            <SplitWords text={t("title")} />
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-paper [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
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
          <p className="text-sm text-paper [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {tBrand("since", { year: establishedYear })}
          </p>
        </Container>
      </section>

      <BannerStrip />

      {/* Shop story — the owners, in their own words. `isolate` keeps the
          ambient layer's z-index:-1 inside this section, `overflow-hidden`
          clips its drifting tints (styles/motion.css → .ambient). */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="ambient" />
        <Container className="py-12">
          <div className="grid items-center gap-8 sm:grid-cols-[3fr_2fr]">
            <Reveal from="left">
              <SectionHeading kicker={tHome("storyKicker")}>
                {tHome("storyHeading")}
              </SectionHeading>
              <blockquote className="relative max-w-prose pl-6">
                <span
                  aria-hidden="true"
                  className="absolute -top-2 left-0 font-heading text-5xl leading-none text-accent"
                >
                  &ldquo;
                </span>
                <p className="leading-relaxed text-ink-soft">
                  {tHome("story")}
                </p>
                <p className="mt-3 font-medium text-ink">
                  {tHome("storyNote")}
                </p>
                <footer className="mt-4 text-sm italic text-ink-soft">
                  {tHome("storySignature", { year: establishedYear })}
                </footer>
              </blockquote>
              <p className="mx-auto mt-8 max-w-xl text-center text-lg italic text-ink-soft sm:text-left">
                {tBrand("tagline")}
              </p>
            </Reveal>
            {/* Two prints laid on the counter: the near-square print desk photo
              (1500×1563) tilted left, the landscape counter photo (4:3)
              overlapping from the right — both at their native aspect ratios,
              so nothing is cropped. */}
            <Reveal
              stagger
              from="right"
              className="mx-auto w-full max-w-sm py-3 sm:max-w-none"
            >
              <figure className="w-[74%] -rotate-2 rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-6 shadow-[var(--shadow-card)]">
                <div className="relative aspect-[1500/1563] overflow-hidden">
                  <Image
                    src="/images/owner2.jpg"
                    alt={tHome("ownerDeskAlt")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 70vw, 28vw"
                  />
                </div>
              </figure>
              <figure className="relative z-10 -mt-[18%] ml-auto w-[85%] rotate-[1.5deg] rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-6 shadow-[var(--shadow-card)]">
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
            </Reveal>
          </div>

          {/* Two short clips shot behind the same counter — video keeps the
            "real shop, real people" promise the photos make. */}
          <Reveal className="mt-14">
            <h3 className="text-center text-sm font-medium uppercase tracking-widest text-accent">
              {tHome("videos.heading")}
            </h3>
            <ShopVideos />
          </Reveal>
        </Container>
      </section>

      <RuledDivider />

      {/* Quick links — the same three destinations as the navbar, so visitors
          who scrolled past it still land somewhere useful. */}
      <Container className="py-12">
        <Reveal>
          <SectionHeading kicker={tHome("explore.kicker")}>
            {tHome("explore.heading")}
          </SectionHeading>
        </Reveal>
        <Reveal
          as="ul"
          stagger
          className="max-w-2xl divide-y divide-[var(--ink-faint)] border-y border-[var(--ink-faint)]"
        >
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
                  className="shrink-0 text-xl text-ink-soft transition-[translate,color] duration-[var(--dur-micro)] ease-soft group-hover:text-accent motion-safe:group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </Container>
    </>
  );
}
