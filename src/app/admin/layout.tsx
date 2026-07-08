import type { Metadata } from "next";
import { Fraunces, Mukta } from "next/font/google";
import "../globals.css";

/**
 * Root layout for /admin — separate from the public [locale] tree.
 * English-only UI (Nepali data still renders: Mukta carries Devanagari).
 */

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mukta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Utsab Books",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${mukta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
