/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The search moved to the home page; keep old /units links working.
  async redirects() {
    return [{ source: "/units", destination: "/", permanent: true }];
  },
  // Geolocation is only requested by this site itself, after the visitor
  // clicks "Usar minha localização"; embedded frames never get access.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Permissions-Policy", value: "geolocation=(self)" }],
      },
    ];
  },
  env: {
    WEB_SAUDE_API_URL: process.env.WEB_SAUDE_API_URL,
  },
};

module.exports = nextConfig;
