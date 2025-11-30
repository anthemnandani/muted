/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['handlebars'] = 'handlebars/dist/handlebars.js';
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    webpackBuildWorker: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'muted-development.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'muted-production.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME,
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
    ],
  },
};

module.exports = nextConfig;
