import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Button from "@/components/Button";
import Container from "@/components/Container";
import RuledDivider from "@/components/RuledDivider";
import StampLogo from "@/components/StampLogo";
import { site } from "@/lib/site";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("hero");
  const tBrand = useTranslations("brand");

  return (
    <>
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

      <RuledDivider />

      <Container className="py-10 text-center">
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-soft">
          {tBrand("tagline")}
        </p>
      </Container>
    </>
  );
}
