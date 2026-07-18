import { getLocale, getTranslations } from "next-intl/server";
import Container from "./Container";
import InkAccent from "./InkAccent";
import { getNoticeSetting, noticeText } from "@/lib/settings";

/**
 * Seasonal notice strip, driven by site_settings.banner (editable from
 * /admin in Phase 4). Falls back to the messages copy when the DB is
 * unreachable; hidden entirely when the owner disables it.
 */
export default async function BannerStrip() {
  const [t, locale, banner] = await Promise.all([
    getTranslations("banner"),
    getLocale(),
    getNoticeSetting("banner"),
  ]);

  if (banner && !banner.enabled) return null;
  const text = (banner && noticeText(banner, locale)) || t("text");

  return (
    <aside className="border-y border-[var(--ink-faint)] bg-paper-shade">
      <Container className="flex items-center gap-3 py-2.5">
        <InkAccent variant="star" className="star-twinkle h-4 w-4 shrink-0 text-accent" />
        <p className="text-sm">
          <span className="shimmer-once mr-2 font-bold uppercase tracking-widest text-accent">
            {t("label")}
          </span>
          {text}
        </p>
      </Container>
    </aside>
  );
}
