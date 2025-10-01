/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable caching for API routes
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig