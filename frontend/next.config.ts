import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Output standalone para Docker
  output: 'standalone',
};

export default nextConfig;
