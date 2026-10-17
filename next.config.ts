import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents is OFF on purpose: every page reads the login cookie,
  // and with it on each read would need extra <Suspense>/"use cache" setup.
  experimental: {
    serverActions: {
      // pad photos are resized in the browser (~1024px) before upload
      bodySizeLimit: "4mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
