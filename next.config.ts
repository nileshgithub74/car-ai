/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ymqpkygmownybanldbpq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "ukuhvqaufhlhzetqgivs.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' https://roadsidecoder.created.app;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
