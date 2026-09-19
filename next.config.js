/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@prisma/adapter-neon",
      "@react-pdf/renderer",
      "firebase-admin",
    ],
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "react-icons/lu",
      "react-icons/hi2",
      "react-icons/fa6",
      "react-icons/fi",
      "react-icons/bi",
    ],
  },
};

module.exports = nextConfig;
