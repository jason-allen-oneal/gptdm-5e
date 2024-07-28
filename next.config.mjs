/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.daisyui.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
