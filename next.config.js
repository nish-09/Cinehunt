/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'ia.media-imdb.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'ia.media-imdb.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    domains: [
      'm.media-amazon.com',
      'ia.media-imdb.com',
      'images-na.ssl-images-amazon.com',
    ],
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
