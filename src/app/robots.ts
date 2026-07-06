import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin and /api arrive in Phases 3–4; excluded from day one
      disallow: ["/admin", "/api"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
