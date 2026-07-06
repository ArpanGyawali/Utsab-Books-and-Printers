import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ServiceTabs from "@/components/ServiceTabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/services`,
      languages: { en: "/en/services", ne: "/ne/services" },
    },
  };
}

export default function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ServicesContent />;
}

function ServicesContent() {
  const t = useTranslations("services");

  return (
    <Container className="py-12">
      <SectionHeading kicker={t("kicker")}>{t("title")}</SectionHeading>
      <p className="mb-8 max-w-xl text-ink-soft">{t("intro")}</p>
      <ServiceTabs />
    </Container>
  );
}
