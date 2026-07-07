/**
 * Phone-number helpers shared by the notify-me form (client) and the
 * /api/notify route handler (server-side revalidation).
 */

/** Normalize Devanagari numerals (०-९ → 0-9) per SKILL.md i18n rules. */
export function normalizeDigits(value: string): string {
  return value.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
}

/**
 * Normalizes user input to a 10-digit Nepali mobile number (9XXXXXXXXX),
 * tolerating Devanagari numerals, spaces/dashes and a +977/977 prefix.
 * Returns null when it doesn't look like a Nepali mobile.
 */
export function normalizeNepaliMobile(raw: string): string | null {
  const digits = normalizeDigits(raw).replace(/[\s\-().]/g, "").replace(/^\+?977/, "");
  return /^9[6-8]\d{8}$/.test(digits) ? digits : null;
}
