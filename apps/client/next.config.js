/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: "loose",
  },
};

module.exports = config;
