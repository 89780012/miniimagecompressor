import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'image.mycompressor.org',
        pathname: '/**',
      }
    ],
  },
}

export default withNextIntl(nextConfig)
