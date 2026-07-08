import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Cover photos and CSV imports arrive as server-action FormData;
    // the default 1 MB cap is too small for phone camera photos.
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    // Admin-uploaded book covers in the public Supabase storage bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/covers/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
