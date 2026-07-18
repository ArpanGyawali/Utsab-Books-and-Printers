"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { isOpenNow, type WeekHours } from "@/lib/site";

// Re-check the clock every minute
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * Live "open now" indicator (Asia/Kathmandu). Server renders nothing;
 * the real state appears after hydration (avoids clock mismatch).
 * Hours come from the server (owner-set via admin settings).
 */
export default function OpenNowDot({
  hours,
  className = "",
}: {
  hours: WeekHours;
  className?: string;
}) {
  const t = useTranslations("nav");
  const open = useSyncExternalStore(
    subscribe,
    () => isOpenNow(hours),
    () => null
  );

  if (open === null) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-ink-soft ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block h-2 w-2 rounded-full ${
          open ? "dot-pulse bg-instock" : "bg-outofstock"
        }`}
      />
      {open ? t("openNow") : t("closedNow")}
    </span>
  );
}
