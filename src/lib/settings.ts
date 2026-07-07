import { unstable_cache } from "next/cache";
import { supabaseServer } from "./supabase/server";

/**
 * Cached site_settings reads, tagged 'settings' — revalidated by the Phase 4
 * admin settings screen.
 *
 * As in lib/books.ts, the try/catch sits outside the cache wrapper so failures
 * are never cached; callers get null and fall back to their hardcoded
 * messages copy.
 */

export type LocalizedNotice = {
  enabled: boolean;
  text_en: string;
  text_ne: string;
};

const getNoticeSettingCached = unstable_cache(
  async (key: "banner" | "closure_notice"): Promise<LocalizedNotice | null> => {
    const { data, error } = await supabaseServer()
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const v = data?.value;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    return {
      enabled: Boolean(v.enabled),
      text_en: typeof v.text_en === "string" ? v.text_en : "",
      text_ne: typeof v.text_ne === "string" ? v.text_ne : "",
    };
  },
  ["site-setting-v2"],
  { tags: ["settings"] }
);

export async function getNoticeSetting(
  key: "banner" | "closure_notice"
): Promise<LocalizedNotice | null> {
  try {
    return await getNoticeSettingCached(key);
  } catch (err) {
    console.warn(`[settings] ${key} unavailable:`, (err as Error).message);
    return null;
  }
}

export function noticeText(notice: LocalizedNotice, locale: string): string {
  return (locale === "ne" ? notice.text_ne : notice.text_en) || notice.text_en;
}
