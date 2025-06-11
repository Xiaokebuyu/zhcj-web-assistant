import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 启用构建时ESLint检查
    ignoreDuringBuilds: false,
  },
  typescript: {
    // 启用构建时TypeScript检查
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
