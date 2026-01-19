import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compiler optimizations
  compiler: {
   
  },
  
  // Increase API body size limit for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Adjust as needed (e.g., '50mb')
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.farcaster.xyz",
      },
      {
        protocol: "https",
        hostname: "*.warpcast.com",
      },
      {
        protocol: "https",
        hostname: "*.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.io",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "abs.twimg.com",
      },
    ],
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
};

export default nextConfig;
