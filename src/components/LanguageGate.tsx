"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import StampLogo from "./StampLogo";

const LANG_CHOSEN_COOKIE = "utsab-lang-chosen";

// Cookie only changes through our own click handler — no subscription needed.
const subscribeNever = () => () => {};

function hasChosenCookie() {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${LANG_CHOSEN_COOKIE}=`));
}

/**
 * First-visit full-screen language chooser. Shows once (cookie-gated),
 * two big buttons, shop lockup on top. Server renders nothing so returning
 * visitors never see a flash.
 */
export default function LanguageGate() {
  const t = useTranslations("langChooser");
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  const chosen = useSyncExternalStore(
    subscribeNever,
    hasChosenCookie,
    () => true
  );

  if (chosen || dismissed) return null;

  function choose(locale: Locale) {
    document.cookie = `${LANG_CHOSEN_COOKIE}=1;path=/;max-age=31536000`;
    setDismissed(true);
    router.replace(pathname, { locale });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-paper px-6"
    >
      <StampLogo size="lg" />
      <p className="text-center text-lg text-ink-soft">{t("title")}</p>
      <div className="flex w-full max-w-sm flex-col gap-4 sm:flex-row">
        <button
          onClick={() => choose("ne")}
          className="flex min-h-20 flex-1 flex-col items-center justify-center rounded-md border-2 border-ink bg-paper-shade px-6 py-4 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          <span className="text-2xl font-bold">{t("ne")}</span>
          <span className="text-sm text-ink-soft">{t("neHint")}</span>
        </button>
        <button
          onClick={() => choose("en")}
          className="flex min-h-20 flex-1 flex-col items-center justify-center rounded-md border-2 border-ink bg-paper-shade px-6 py-4 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          <span className="text-2xl font-bold">{t("en")}</span>
          <span className="text-sm text-ink-soft">{t("enHint")}</span>
        </button>
      </div>
    </div>
  );
}
