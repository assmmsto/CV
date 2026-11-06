import type { NextConfig } from "next";

/**
 * Two build modes:
 *  - default          → output: "standalone" (server build, PDF engine via /api/export/pdf)
 *  - STATIC_EXPORT=1  → output: "export"   (static files for the Android APK WebView)
 */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  ...(isStatic ? { images: { unoptimized: true } } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
