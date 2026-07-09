import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Fraunces, Mukta } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageGate from "@/components/LanguageGate";
import { site } from "@/lib/site";
import { getShopHours } from "@/lib/settings";
import "../globals.css";

// Body + Devanagari. Mukta covers both scripts; Nepali headings fall back to it.
const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mukta",
  display: "swap",
});

// Characterful serif for Latin headings (no Devanagari glyphs — by design).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ne: "/ne" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const hours = await getShopHours();

  return (
    <html
      lang={locale}
      className={`${mukta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <LanguageGate />
          <Navbar hours={hours} />
          <main className="flex-1">{children}</main>
          <Footer hours={hours} />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
