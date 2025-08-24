// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",        // <— important for Docker multi-stage run
  reactStrictMode: true,
  poweredByHeader: false,
  // (optional) If you serve images from your API/domain, allow them:
  // images: { remotePatterns: [{ protocol: "https", hostname: "auth-server" }] },
};

export default nextConfig;
