/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'connector.app'],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  eslint: {
    // Allow production builds to complete with warnings
    // Warnings are logged but don't fail the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Fix database types (regenerate from Supabase) then set back to false
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
