import { getLocale, getTranslations } from "next-intl/server";
import { getNoticeSetting, noticeText } from "@/lib/settings";

/**
 * Festival-closure slot on the contact page, driven by
 * site_settings.closure_notice (editable from /admin in Phase 4).
 */
export default async function ClosureNotice() {
  const [t, locale, notice] = await Promise.all([
    getTranslations("contact"),
    getLocale(),
    getNoticeSetting("closure_notice"),
  ]);

  const text = notice?.enabled ? noticeText(notice, locale) : "";
  if (!text) return <p className="text-ink-soft">{t("closureNone")}</p>;

  return (
    <p className="rounded-md border-[1.5px] border-arriving bg-paper-shade/60 p-4 font-medium text-arriving">
      {text}
    </p>
  );
}
