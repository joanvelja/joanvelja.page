/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [160, 256, 320, 384, 480],
    qualities: [75, 82],
  },
  turbopack: {},
};

import bundleAnalyzer from '@next/bundle-analyzer';

        const withBundleAnalyzer = bundleAnalyzer({
          enabled: process.env.ANALYZE === 'true',
        });

        export default withBundleAnalyzer(nextConfig);
