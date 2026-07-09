"use client";

import { useLocale } from "next-intl";

/**
 * External inquiry link (wa.me / viber) that beacons an inquire_click event
 * before the OS hands off to the app. sendBeacon survives the navigation;
 * tracking failures are invisible and harmless by design.
 */
export default function InquireLink({
  href,
  title,
  bookClass,
  source,
  className,
  children,
}: {
  href: string;
  title?: string;
  bookClass?: string;
  source: "book_card" | "no_results" | "results_footer" | "class_set";
  className?: string;
  children: React.ReactNode;
}) {
  const locale = useLocale();

  const track = () => {
    try {
      navigator.sendBeacon(
        "/api/event",
        new Blob(
          [
            JSON.stringify({
              type: "inquire_click",
              title: title ?? null,
              class: bookClass ?? null,
              source,
              locale,
            }),
          ],
          { type: "application/json" }
        )
      );
    } catch {
      // never let analytics break the actual inquiry
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      className={className}
    >
      {children}
    </a>
  );
}
