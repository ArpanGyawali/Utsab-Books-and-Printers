import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import ClosureNotice from "@/components/ClosureNotice";
import Container from "@/components/Container";
import HoursTable from "@/components/HoursTable";
import InkAccent from "@/components/InkAccent";
import SectionHeading from "@/components/SectionHeading";
import { telLink, viberLink, waLink } from "@/lib/inquiry";
import { localizedAddress, localizedName, site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: "/en/contact", ne: "/ne/contact" },
    },
  };
}

export default function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("contact");
  const locale = useLocale();

  return (
    <Container className="py-12">
      <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>

      {/* Map + "how locals find us" landmark card */}
      <div className="grid gap-6 sm:grid-cols-[3fr_2fr]">
        <div className="overflow-hidden rounded-md border border-[var(--ink-faint)] shadow-[var(--shadow-card)]">
          <iframe
            src={site.mapsEmbedUrl}
            title={t("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full sm:h-full sm:min-h-80"
          />
        </div>

        <div className="rounded-md bg-paper-shade/70 p-5">
          <h3 className="text-lg font-semibold">{t("landmarkHeading")}</h3>
          <InkAccent variant="underline" className="mt-1 mb-3 h-2.5 w-24 text-accent" />
          {/* TODO(assets): replace with the owner's real landmark directions */}
          <p className="leading-relaxed text-ink-soft">{t("landmark")}</p>
          <p className="mt-2 text-xs text-ink-soft/80">{t("landmarkNote")}</p>

          <h3 className="mt-6 text-lg font-semibold">{t("addressHeading")}</h3>
          <p className="mt-1 text-ink-soft">
            {localizedName(locale)}
            <br />
            {localizedAddress(locale)}
          </p>
        </div>
      </div>

      {/* Tap-to-call / WhatsApp / Viber */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={telLink()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-accent-deep bg-accent px-5 py-2.5 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
        >
          {t("call")} · {site.phone}
        </a>
        <a
          href={waLink(t("waGreeting"))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border-[1.5px] border-ink px-5 py-2.5 font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          {t("whatsapp")}
        </a>
        <a
          href={viberLink()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border-[1.5px] border-ink px-5 py-2.5 font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          {t("viber")}
        </a>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        <a href={`tel:${site.phoneSecondary.replace(/[^+\d]/g, "")}`} className="underline decoration-ink-soft/40 underline-offset-2">
          {t("altPhone", { phone: site.phoneSecondary })}
        </a>
      </p>

      {/* Hours with today highlighted */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">{t("hoursHeading")}</h3>
          <HoursTable />
        </div>
        <div>
          <h3 className="mb-3 text-lg font-semibold">{t("closureHeading")}</h3>
          <ClosureNotice />
        </div>
      </div>
    </Container>
  );
}
