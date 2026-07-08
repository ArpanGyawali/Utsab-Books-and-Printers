"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { site, type WeekHours } from "@/lib/site";

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const subscribeNever = () => () => {};

function todayInKathmandu(): number {
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timezone,
    weekday: "short",
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

/**
 * Opening-hours table with today's row highlighted (Asia/Kathmandu).
 * Server renders without highlight; it appears after hydration.
 */
export default function HoursTable({ hours }: { hours: WeekHours }) {
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const today = useSyncExternalStore(subscribeNever, todayInKathmandu, () => -1);

  return (
    <table className="w-full max-w-sm text-sm">
      <tbody>
        {hours.map((h, day) => {
          const isToday = day === today;
          return (
            <tr
              key={day}
              className={
                isToday ? "bg-paper-shade font-semibold text-ink" : "text-ink-soft"
              }
            >
              <th scope="row" className="rounded-l-sm py-1.5 pl-2 pr-3 text-left [font-weight:inherit]">
                {t(`days.${dayKeys[day]}`)}
                {isToday ? (
                  <span className="ml-2 stamp-border inline-block px-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                    {tContact("today")}
                  </span>
                ) : null}
              </th>
              <td className="rounded-r-sm py-1.5 pr-2 text-right tabular-nums">
                {h ? `${h.open}–${h.close}` : t("closed")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
