import { requireAdmin } from "@/lib/admin/auth";
import { defaultHours, type WeekHours } from "@/lib/site";
import type { LocalizedNotice } from "@/lib/settings";
import HoursForm from "@/components/admin/HoursForm";
import NoticeForm from "@/components/admin/NoticeForm";

/**
 * Settings — banner, closure notice, hours. Reads go through the session
 * client (fresh, uncached); the cached public readers live in lib/settings.ts.
 */

function asNotice(v: unknown): LocalizedNotice | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  return {
    enabled: Boolean(o.enabled),
    text_en: typeof o.text_en === "string" ? o.text_en : "",
    text_ne: typeof o.text_ne === "string" ? o.text_ne : "",
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function asHours(v: unknown): WeekHours | null {
  const days = (v as { days?: unknown[] } | null)?.days;
  if (!Array.isArray(days) || days.length !== 7) return null;
  const parsed = days.map((d) => {
    if (d === null) return null;
    const { open, close } = (d ?? {}) as { open?: unknown; close?: unknown };
    return typeof open === "string" &&
      typeof close === "string" &&
      TIME_RE.test(open) &&
      TIME_RE.test(close)
      ? { open, close }
      : undefined;
  });
  return parsed.some((d) => d === undefined) ? null : (parsed as WeekHours);
}

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("site_settings").select("key, value");
  const byKey = new Map((data ?? []).map((r) => [r.key, r.value]));

  return (
    <>
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="mt-5 grid gap-4">
        <NoticeForm
          settingKey="banner"
          heading="Season banner"
          hint="The strip on the home page — new session books, offers, etc."
          initial={asNotice(byKey.get("banner"))}
        />
        <NoticeForm
          settingKey="closure_notice"
          heading="Closure notice"
          hint="For festivals or holidays — shows on the contact page. Turn it off when you reopen."
          initial={asNotice(byKey.get("closure_notice"))}
        />
        <HoursForm initial={asHours(byKey.get("hours")) ?? defaultHours} />
      </div>
    </>
  );
}
