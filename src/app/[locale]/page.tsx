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

const stripPhotos = [
  { src: "/images/placeholders/shop-interior.svg", key: "interior" },
  { src: "/images/placeholders/stationery.svg", key: "stationery" },
  { src: "/images/placeholders/printing.svg", key: "printing" },
] as const;

function HomeContent({ hours }: { hours: WeekHours }) {
  const t = useTranslations("hero");
  const tBrand = useTranslations("brand");
  const tHome = useTranslations("home");

  return (
    <>
      <LocalBusinessJsonLd hours={hours} />

      {/* Hero — full-bleed shop photo with ink overlay.
          TODO(assets): swap placeholder for the real exterior photo. */}
      <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/placeholders/shop-exterior.svg"
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

      {/* Three-photo strip. TODO(assets): swap for real shop photos. */}
      <Container className="py-10">
        <ul className="grid gap-3 sm:grid-cols-3">
          {stripPhotos.map(({ src, key }) => (
            <li
              key={key}
              className="relative aspect-[8/5] overflow-hidden rounded-md shadow-[var(--shadow-card)]"
            >
              <Image
                src={src}
                alt={tHome(`photoStrip.${key}`)}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </li>
          ))}
        </ul>
      </Container>

      <RuledDivider />

      {/* Shop story. TODO(assets): replace placeholder with the owner's own
          words (Nepali first, then translated — ASSETS.md §3). */}
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
          <div className="relative aspect-[4/5] overflow-hidden rounded-md shadow-[var(--shadow-card)]">
            <Image
              src="/images/placeholders/owner.svg"
              alt={tHome("ownerPhotoAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
          </div>
        </div>
      </Container>
    </>
  );
}
