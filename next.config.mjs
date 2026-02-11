/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external sources (team flags, etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
