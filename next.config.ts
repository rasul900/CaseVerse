import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.steamapis.com' },
      { protocol: 'https', hostname: 'steamcommunity-a.akamaihd.net' },
      { protocol: 'https', hostname: 'community.cloudflare.steamstatic.com' },
      { protocol: 'https', hostname: 'community.akamai.steamstatic.com' },
    ],
  },
};

export default nextConfig;
