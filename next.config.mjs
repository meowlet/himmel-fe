/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "osu.ppy.sh",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    domains: ["your-api-domain.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
