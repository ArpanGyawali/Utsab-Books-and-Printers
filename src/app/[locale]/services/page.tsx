import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import StubPage from "@/components/StubPage";

// Real notebook-tab services page lands in Phase 2.
export default function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <StubPage page="services" />;
}
