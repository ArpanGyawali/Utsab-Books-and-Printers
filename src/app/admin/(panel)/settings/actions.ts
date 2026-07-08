"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { DayHours } from "@/lib/site";

/**
 * Settings mutations — banner, closure notice, opening hours. All upsert into
 * site_settings on the session client (RLS-checked) and update the 'settings'
 * tag so the public pages refresh immediately.
 */

export type SettingsState = { ok: true } | { error: string } | null;

const NOTICE_KEYS = new Set(["banner", "closure_notice"]);
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function saveNotice(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();

  const key = String(formData.get("key") ?? "");
  if (!NOTICE_KEYS.has(key)) return { error: "Unknown setting." };

  const enabled = formData.get("enabled") === "on";
  const text_en = String(formData.get("text_en") ?? "").trim().slice(0, 300);
  const text_ne = String(formData.get("text_ne") ?? "").trim().slice(0, 300);
  if (enabled && !text_en && !text_ne) {
    return { error: "Write the text (at least one language) or turn it off." };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: { enabled, text_en, text_ne } });
  if (error) return { error: `Could not save: ${error.message}` };

  updateTag("settings");
  return { ok: true };
}

const DAY_FIELDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export async function saveHours(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();

  const days: DayHours[] = [];
  for (const day of DAY_FIELDS) {
    if (formData.get(`${day}_closed`) === "on") {
      days.push(null);
      continue;
    }
    const open = String(formData.get(`${day}_open`) ?? "").trim();
    const close = String(formData.get(`${day}_close`) ?? "").trim();
    if (!TIME_RE.test(open) || !TIME_RE.test(close)) {
      return { error: `Set opening and closing times for ${day} (or tick closed).` };
    }
    if (close <= open) {
      return { error: `Closing time must be after opening time on ${day}.` };
    }
    days.push({ open, close });
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "hours", value: { days } });
  if (error) return { error: `Could not save: ${error.message}` };

  updateTag("settings");
  return { ok: true };
}
