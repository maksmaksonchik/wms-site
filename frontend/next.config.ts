import type { NextConfig } from "next";

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL;
const assetsPathname = process.env.ASSETS_PATHNAME ?? "/uploads/**";
const isDevMode = process.env.ASSETS_MODE === "dev";

if (!assetsBaseUrl) {
  throw new Error(
    "Не задана переменная окружения NEXT_PUBLIC_ASSETS_BASE_URL (front)"
  );
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isDevMode,
    remotePatterns: [new URL(assetsBaseUrl + assetsPathname)],
  },
};

export default nextConfig;
