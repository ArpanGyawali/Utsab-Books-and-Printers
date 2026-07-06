import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import StubPage from "@/components/StubPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.books" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/books`,
      languages: { en: "/en/books", ne: "/ne/books" },
    },
  };
}

// Look for Book (the differentiator) lands in Phase 3 with Supabase.
export default function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <StubPage page="books" />;
}
