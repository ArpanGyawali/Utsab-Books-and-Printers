"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LANG_CHOSEN_COOKIE = "utsab-lang-chosen";

/**
 * EN / नेपाली segmented toggle. Preserves the current path when switching.
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("langToggle");
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className={`inline-flex items-stretch overflow-hidden rounded-sm border-[1.5px] border-ink text-sm ${className}`}
    >
      {routing.locales.map((locale: Locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          onClick={() => {
            document.cookie = `${LANG_CHOSEN_COOKIE}=1;path=/;max-age=31536000`;
          }}
          aria-current={locale === active ? "true" : undefined}
          className={`flex min-h-9 items-center px-2.5 font-medium transition-colors duration-150 ${
            locale === active
              ? "bg-ink text-paper"
              : "bg-transparent text-ink hover:bg-paper-shade"
          }`}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
