import type { NextConfig } from "next";

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL;
const assetsPathname = process.env.ASSETS_PATHNAME ?? "/uploads/**";
const isDevMode = process.env.ASSETS_DEV_MODE === "true";

if (!assetsBaseUrl) {
  throw new Error(
    "Не задана переменная окружения NEXT_PUBLIC_ASSETS_BASE_URL (front)"
  );
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isDevMode,
    remotePatterns: [new URL(assetsBaseUrl + assetsPathname)],
    // По умолчанию кэш оптимизированных картинок может занять до 50% свободного диска
    maximumDiskCacheSize: 500_000_000,
  },
  output: "standalone"
};

export default nextConfig;
