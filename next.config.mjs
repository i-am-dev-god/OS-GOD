/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['*.e2b.app'],
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
