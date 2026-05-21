import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@ai-vantage/contracts', '@ai-vantage/kg'],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
