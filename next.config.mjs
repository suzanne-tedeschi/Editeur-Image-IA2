export default {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lytalbwasjtohwzpenxz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      },
    ],
  },
}
