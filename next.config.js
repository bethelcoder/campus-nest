/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@react-pdf/renderer"],
  },
};

module.exports = nextConfig;
