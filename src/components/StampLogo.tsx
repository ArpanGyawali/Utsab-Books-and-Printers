import { useLocale, useTranslations } from "next-intl";
import { site } from "@/lib/site";

/**
 * Stamp-style logo lockup (EN + NE via messages).
 * TODO(assets): replace/redraw once the owner's logo arrives — if none exists,
 * this stamp mark IS the logo (per ASSETS.md §2).
 */
export default function StampLogo({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const t = useTranslations("brand");
  const locale = useLocale();

  const sizing =
    size === "lg"
      ? "px-6 py-4 text-2xl sm:text-3xl"
      : "px-3 py-1.5 text-sm sm:text-base";

  return (
    <span
      className={`stamp-border inline-block -rotate-1 select-none text-[var(--stamp)] ${sizing} ${className}`}
    >
      <span
        className={`block font-bold uppercase leading-tight ${
          locale === "ne" ? "tracking-normal" : "tracking-[0.12em]"
        }`}
      >
        {t("name")}
      </span>
      {size === "lg" ? (
        <span className="mt-1 block text-center text-[0.45em] font-medium uppercase tracking-[0.3em] text-ink-soft">
          {t("since", { year: site.establishedYear })}
        </span>
      ) : null}
    </span>
  );
}
