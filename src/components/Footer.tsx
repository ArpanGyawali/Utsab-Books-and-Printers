import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Container from "./Container";
import InkAccent from "./InkAccent";
import { site, localizedAddress, localizedName, type WeekHours } from "@/lib/site";

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function Footer({ hours }: { hours: WeekHours }) {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="mt-16 border-t border-[var(--ink-faint)] bg-paper-shade">
      <Container className="grid gap-10 py-10 sm:grid-cols-3">
        <div>
          <h2 className="mb-2 text-base font-semibold">{t("addressHeading")}</h2>
          {/* The shop seal as a letterhead mark; the name below names it */}
          <Image
            src="/images/logo.png"
            alt=""
            width={64}
            height={64}
            sizes="64px"
            className="mb-3 h-16 w-16 select-none"
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            {localizedName(locale)}
            <br />
            {localizedAddress(locale)}
          </p>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent"
          >
            {t("viewOnMap")}
          </a>
        </div>

        <div>
          <h2 className="mb-2 text-base font-semibold">{t("hoursHeading")}</h2>
          <InkAccent variant="star" className="mb-3 h-5 w-5 text-accent" />
          <table className="w-full max-w-60 text-sm text-ink-soft">
            <tbody>
              {hours.map((h, day) => (
                <tr key={day}>
                  <th scope="row" className="py-0.5 pr-3 text-left font-normal">
                    {t(`days.${dayKeys[day]}`)}
                  </th>
                  <td className="py-0.5 text-right tabular-nums">
                    {h ? `${h.open}–${h.close}` : t("closed")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-2 text-base font-semibold">{t("contactHeading")}</h2>
          <InkAccent variant="underline" className="mb-3 h-2 w-16 text-accent" />
          <p className="text-sm text-ink-soft">
            <a href={`tel:${site.phone}`} className="font-medium text-ink">
              {site.phone}
            </a>
          </p>
        </div>
      </Container>

      <div className="border-t border-[var(--ink-faint)] py-4">
        <Container>
          <p className="text-xs text-ink-soft">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </Container>
      </div>
    </footer>
  );
}
