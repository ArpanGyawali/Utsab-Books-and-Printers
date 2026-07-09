import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const paths = ["", "/services", "/books", "/books/list", "/contact"] as const;
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
