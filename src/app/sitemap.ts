import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// The showcase ships one URL per kind: /shop is the stationery tab, and the
// sports tab is a real, shareable, indexable query URL.
const paths = [
  "",
  "/services",
  "/shop",
  "/shop?kind=sports",
  "/books",
  "/contact",
] as const;
const locales = ["en", "ne"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      changeFrequency: path === "/books" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/books" ? 0.9 : 0.7,
      alternates: {
        languages: {
          en: `${site.url}/en${path}`,
          ne: `${site.url}/ne${path}`,
        },
      },
    }))
  );
}
