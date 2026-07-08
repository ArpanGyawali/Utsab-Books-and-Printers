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
  // Query-based embed (Google listing: "Utsab Books And Printers", kgmid /g/11npvknzh2).
  // TODO(assets): swap for an exact-pin embed once owner shares coordinates.
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Utsab%20Books%20And%20Printers%2C%20Ranibagiya%2C%20Sainamaina%2C%20Rupandehi&z=15&hl=ne&output=embed",

  // Canonical site URL (swap to https://utsabbooks.com.np when domain approves)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://utsab-books-and-printers.vercel.app",

  // Primary number — WhatsApp and calls
  phone: "+977-9851017951",
  // Secondary number — calls only
  phoneSecondary: "+977-9841254514",
  whatsapp: process.env.NEXT_PUBLIC_SHOP_WA ?? "9779851017951",
  // TODO(assets): link real Facebook page if one exists
  facebookUrl: "",

  timezone: "Asia/Kathmandu",
} as const;

/** One day's opening hours (24h clock); null = closed that day. */
export type DayHours = { open: string; close: string } | null;
/** Opening hours for the week, indexed 0=Sunday … 6=Saturday. */
export type WeekHours = DayHours[];

/**
 * Fallback opening hours, used until the owner saves his own in the admin
 * settings screen (stored in site_settings, read via getShopHours()).
 * TODO(assets): placeholder schedule — confirm with owner.
 */
export const defaultHours: WeekHours = [
  { open: "06:30", close: "19:30" },
  { open: "06:30", close: "19:30" },
  { open: "06:30", close: "19:30" },
  { open: "06:30", close: "19:30" },
  { open: "06:30", close: "19:30" },
  { open: "06:30", close: "19:30" },
  { open: "07:00", close: "12:00" },
];

export function localizedName(locale: string) {
  return locale === "ne" ? site.nameNe : site.nameEn;
}

export function localizedAddress(locale: string) {
  return locale === "ne" ? site.address.ne : site.address.en;
}

/** True if the shop is open right now in Asia/Kathmandu. */
export function isOpenNow(hours: WeekHours, now: Date = new Date()): boolean {
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
  const today = hours[dayIndex];
  if (!today) return false;

  const current = `${hour}:${minute}`;
  return current >= today.open && current < today.close;
}
