import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Cover photos and CSV imports arrive as server-action FormData;
    // the default 1 MB cap is too small for phone camera photos.
    serverActions: { bodySizeLimit: "8mb" },
  },
  async redirects() {
    // /stationery became /shop (stationery + sports) in 0012 — the old URL is
    // in the sitemap and in the wild, so keep it alive permanently.
    return [
      {
        source: "/:locale(en|ne)/stationery",
        destination: "/:locale/shop",
        permanent: true,
      },
    ];
  },
  images: {
    // Admin uploads in public Supabase storage buckets (covers, booklist photo).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/covers/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/booklists/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
