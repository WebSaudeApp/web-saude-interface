/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WEB_SAUDE_API_URL: process.env.WEB_SAUDE_API_URL,
  },
};

module.exports = nextConfig;
