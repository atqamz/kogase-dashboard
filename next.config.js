/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  // Enable Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable React Fast Refresh
      config.experiments = { ...config.experiments, topLevelAwait: true };
    }
    return config;
  },
  // Ensure we handle trailing slashes properly
  trailingSlash: false,
  // Configure output directory
  distDir: ".next",
  // Ensure we're properly handling images
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

module.exports = nextConfig;
