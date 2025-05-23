/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/home',
            },
        ]
    },

    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true
            },
        ]
    },

     eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
};

export default nextConfig;
