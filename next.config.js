/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Enable static optimization
  swcMinify: true,
  // Configure image domains if needed
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig 