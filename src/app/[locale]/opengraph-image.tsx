import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Utsab Books and Printers — Ranibagiya, Sainamaina, Rupandehi";

/*
 * Text-only OG card in the paper/ink system. English-only for now: satori's
 * default font has no Devanagari glyphs. TODO(phase-5): embed a Mukta subset
 * and add the Nepali lockup + real logo.
 */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f3ea",
          color: "#1e2430",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "6px double #8f3128",
            borderRadius: 8,
            padding: "48px 72px",
            transform: "rotate(-1deg)",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#8f3128",
              textAlign: "center",
            }}
          >
            {site.nameEn}
          </div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#4a5160" }}>
            Books · Stationery · Printing
          </div>
          <div style={{ fontSize: 26, marginTop: 12, color: "#4a5160" }}>
            {site.address.en}
          </div>
        </div>
      </div>
    ),
    size
  );
}
