/**
 * Business facts — single source of truth for name, address, hours, contacts.
 * Placeholder values are marked TODO(assets); update as ASSETS.md items arrive.
 */

export const site = {
  nameEn: "Utsab Books and Printers",
  // TODO(assets): confirm Devanagari spelling with owner (उत्सव vs उत्सब)
  nameNe: "उत्सव बुक्स एण्ड प्रिन्टर्स",

  // TODO(assets): placeholder — owner to confirm establishment year
  establishedYear: 2015,

  address: {
    en: "Ranibagiya, Sainamaina-1, Rupandehi",
    ne: "रानीबगिया, सैनामैना-१, रूपन्देही",
  },
  mapsUrl: "https://share.google/PpisejsuDEO8yVQ5L",

  // TODO(assets): placeholder numbers — replace with the shop's real ones
  phone: "+977-9800000000",
  whatsapp: process.env.NEXT_PUBLIC_SHOP_WA ?? "9779800000000",
  // TODO(assets): link real Facebook page if one exists
  facebookUrl: "",

  timezone: "Asia/Kathmandu",
  /**
   * Opening hours, 24h clock, keyed 0=Sunday … 6=Saturday.
   * TODO(assets): placeholder schedule — confirm with owner.
   */
  hours: [
    { day: 0, open: "06:30", close: "19:30" },
    { day: 1, open: "06:30", close: "19:30" },
    { day: 2, open: "06:30", close: "19:30" },
    { day: 3, open: "06:30", close: "19:30" },
    { day: 4, open: "06:30", close: "19:30" },
    { day: 5, open: "06:30", close: "19:30" },
    { day: 6, open: "07:00", close: "12:00" },
  ] as const,
} as const;

export function localizedName(locale: string) {
  return locale === "ne" ? site.nameNe : site.nameEn;
}

export function localizedAddress(locale: string) {
  return locale === "ne" ? site.address.ne : site.address.en;
}

/** True if the shop is open right now in Asia/Kathmandu. */
export function isOpenNow(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";

  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday
  );
  const today = site.hours.find((h) => h.day === dayIndex);
  if (!today) return false;

  const current = `${hour}:${minute}`;
  return current >= today.open && current < today.close;
}
