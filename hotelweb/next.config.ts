import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel için output ayarını kaldırıyoruz
  experimental: {
    // Vercel otomatik olarak optimize eder
  },
};

export default nextConfig;
