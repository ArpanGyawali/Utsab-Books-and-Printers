/**
 * A.D. → Bikram Sambat for display (arriving-book dates in the NE locale).
 *
 * Month-length tables sliced from nepali-date-converter@3.4.0 (B.S. calendars
 * are published lookup data, not computable). Anchor verified against the
 * official New Year dates 2080–2084 B.S. Out-of-range dates return null and
 * callers fall back to A.D. — extend the table before Chaitra 2090 (≈2034).
 */

const ANCHOR_AD_UTC = Date.UTC(2023, 3, 14); // 1 Baishakh 2080
const FIRST_YEAR = 2080;

// prettier-ignore
const BS_MONTH_DAYS: number[][] = [
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2080
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2081
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2082
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2083
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2084
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2085
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2086
  [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2087
  [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30], // 2088
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2089
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2090
];

export type BSDate = {
  year: number;
  /** 0 = Baishakh … 11 = Chaitra; display names come from the messages files */
  monthIndex: number;
  day: number;
};

export function toBS(date: Date): BSDate | null {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  let days = Math.floor((utc - ANCHOR_AD_UTC) / 86_400_000);
  if (days < 0) return null;

  for (let y = 0; y < BS_MONTH_DAYS.length; y++) {
    for (let m = 0; m < 12; m++) {
      const len = BS_MONTH_DAYS[y][m];
      if (days < len) return { year: FIRST_YEAR + y, monthIndex: m, day: days + 1 };
      days -= len;
    }
  }
  return null;
}
