/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com', 'localhost'],
    formats: ['image/avif', 'image/webp']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ]
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  swcMinify: true,
  compiler: {
    styledComponents: true
  }
};

module.exports = nextConfig;