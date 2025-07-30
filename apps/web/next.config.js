/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@portfolio/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

module.exports = nextConfig;