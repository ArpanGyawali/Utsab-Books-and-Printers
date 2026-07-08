import { useLocale } from "next-intl";
import { site, localizedName, type WeekHours } from "@/lib/site";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * LocalBusiness structured data for the home page.
 * No geo coordinates yet — TODO(assets): add once the exact pin is known.
 * Never add fake aggregate ratings (SKILL.md SEO rules).
 */
export default function LocalBusinessJsonLd({ hours }: { hours: WeekHours }) {
  const locale = useLocale();

  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: localizedName(locale),
    alternateName: locale === "ne" ? site.nameEn : site.nameNe,
    url: site.url,
    telephone: site.phone,
    hasMap: site.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ranibagiya",
      addressLocality: "Sainamaina-1",
      addressRegion: "Rupandehi",
      addressCountry: "NP",
    },
    openingHoursSpecification: hours.flatMap((h, day) =>
      h
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: dayNames[day],
              opens: h.open,
              closes: h.close,
            },
          ]
        : []
    ),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
