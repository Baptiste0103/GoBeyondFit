import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enable standalone output to reduce Docker image size
  // Turbopack disabled due to memory issues in Docker - use default webpack instead
  poweredByHeader: false, // Reduce headers
  productionBrowserSourceMaps: false, // Don't generate source maps in production
  compress: true, // Enable gzip compression
  
  // Ensure proper asset loading for both localhost and 127.0.0.1
  assetPrefix: undefined,
  
  // CSS optimization
  experimental: {
    optimizeCss: false, // Disable CSS optimization to avoid issues with Tailwind v4
  },
};

export default nextConfig;
