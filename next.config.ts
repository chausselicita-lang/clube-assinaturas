import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/clube-assinaturas',
  output: 'export',
  distDir: 'docs',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
