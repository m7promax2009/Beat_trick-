/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_STATIC === 'true'

const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  trailingSlash: isExport,
  ...(isExport
    ? { output: 'export' }
    : {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
            },
          ]
        },
      }),
}

module.exports = nextConfig

