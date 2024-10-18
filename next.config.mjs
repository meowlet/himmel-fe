/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "osu.ppy.sh" }],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
