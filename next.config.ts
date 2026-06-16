import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/clube-assinaturas',
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
