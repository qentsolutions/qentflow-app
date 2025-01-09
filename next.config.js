/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qentsolutions-app-attachments.s3.eu-west-3.amazonaws.com",
        pathname: "/**", // Permet toutes les images de ce domaine
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh", // Ajouter ce domaine ici
        pathname: "/**", // Permet toutes les images de ce domaine
      },
    ],
  },
};

module.exports = nextConfig;
