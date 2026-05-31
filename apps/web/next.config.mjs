/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@music-edu/graphql-schema'],
  images: {
    domains: ['localhost', 'storage.googleapis.com', 'cdn.musicedu.app'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
