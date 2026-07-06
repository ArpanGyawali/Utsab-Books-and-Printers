import { useTranslations } from "next-intl";
import Container from "./Container";
import InkAccent from "./InkAccent";

/**
 * Seasonal notice strip. Hardcoded placeholder for now — Phase 3 wires it
 * to the `site_settings` table so the owner can edit it from /admin.
 */
export default function BannerStrip() {
  const t = useTranslations("banner");

  return (
    <aside className="border-y border-[var(--ink-faint)] bg-paper-shade">
      <Container className="flex items-center gap-3 py-2.5">
        <InkAccent variant="star" className="h-4 w-4 shrink-0 text-accent" />
        <p className="text-sm">
          <span className="mr-2 font-bold uppercase tracking-widest text-accent">
            {t("label")}
          </span>
          {t("text")}
        </p>
      </Container>
    </aside>
  );
}
