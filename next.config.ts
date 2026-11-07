import type { NextConfig } from "next";

/**
 * Three build modes:
 *  - default              → output: "standalone" (server build, PDF engine via /api/export/pdf)
 *  - STATIC_EXPORT=1      → output: "export"      (static files for the Android APK WebView, served at root)
 *  - PAGES_EXPORT=1       → output: "export"      (static files for GitHub Pages, served under /CV/app/)
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const isPages = process.env.PAGES_EXPORT === "1";
const isExport = isStatic || isPages;

const nextConfig: NextConfig = {
  output: isExport ? "export" : "standalone",
  ...(isPages ? { basePath: "/CV/app" } : {}),
  ...(isExport ? { images: { unoptimized: true } } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
