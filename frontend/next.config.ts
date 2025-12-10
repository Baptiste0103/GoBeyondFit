import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enable standalone output to reduce Docker image size
  // Turbopack disabled due to memory issues in Docker - use default webpack instead
  poweredByHeader: false, // Reduce headers
  productionBrowserSourceMaps: false, // Don't generate source maps in production
  compress: true, // Enable gzip compression
};

export default nextConfig;
