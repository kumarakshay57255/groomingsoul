import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16's optimizer rejects the local backend host during dev/staging,
    // so serve images directly. Re-enable optimization behind a real domain in prod.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5040",
        pathname: "/uploads/**",
      },
      // When the backend moves behind a real domain later, add it here.
    ],
  },
};

export default nextConfig;
