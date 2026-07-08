import { unstable_cache } from "next/cache";
import { defaultHours, type DayHours, type WeekHours } from "./site";
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

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseDay(v: unknown): DayHours | undefined {
  if (v === null) return null;
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const { open, close } = v as { open?: unknown; close?: unknown };
    if (
      typeof open === "string" &&
      typeof close === "string" &&
      TIME_RE.test(open) &&
      TIME_RE.test(close)
    ) {
      return { open, close };
    }
  }
  return undefined; // malformed
}

const getShopHoursCached = unstable_cache(
  async (): Promise<WeekHours | null> => {
    const { data, error } = await supabaseServer()
      .from("site_settings")
      .select("value")
      .eq("key", "hours")
      .maybeSingle();
    if (error) throw new Error(error.message);

    const days = (data?.value as { days?: unknown[] } | null)?.days;
    if (!Array.isArray(days) || days.length !== 7) return null;
    const parsed = days.map(parseDay);
    if (parsed.some((d) => d === undefined)) return null;
    return parsed as WeekHours;
  },
  ["shop-hours-v1"],
  { tags: ["settings"] }
);

/** Owner-set opening hours, falling back to the defaults in lib/site.ts. */
export async function getShopHours(): Promise<WeekHours> {
  try {
    return (await getShopHoursCached()) ?? defaultHours;
  } catch (err) {
    console.warn("[settings] hours unavailable:", (err as Error).message);
    return defaultHours;
  }
}
