/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: true, // Enable HMR caching for better performance
    optimizePackageImports: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', 'lucide-react'],
  },
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
    // Faster builds in development
    swcMinify: false,
  }),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ymqpkygmownybanldbpq.supabase.co" },
      { protocol: "https", hostname: "ukuhvqaufhlhzetqgivs.supabase.co" },
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
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
