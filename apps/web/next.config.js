/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@portfolio/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard',
      },
      {
        source: '/holdings',
        destination: '/holdings',
      },
      {
        source: '/performance',
        destination: '/performance',
      },
      {
        source: '/activities',
        destination: '/activities',
      },
      {
        source: '/settings',
        destination: '/settings',
      },
    ];
  },
};

module.exports = nextConfig;