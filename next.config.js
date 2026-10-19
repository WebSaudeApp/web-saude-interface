/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The search moved to the home page; keep old /units links working.
  async redirects() {
    return [{ source: "/units", destination: "/", permanent: true }];
  },
  env: {
    WEB_SAUDE_API_URL: process.env.WEB_SAUDE_API_URL,
  },
};

module.exports = nextConfig;
