const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    dirs: ['app', 'components', 'lib', 'contexts', 'hooks'],
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid intermittent cache corruption in dev on synced folders (e.g. OneDrive).
      config.cache = false;
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
