/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  turbopack: {},
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /supabase\/functions/,
    };
    return config;
  },
};

module.exports = nextConfig;
