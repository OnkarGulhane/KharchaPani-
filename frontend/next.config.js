/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  transpilePackages: ["recharts"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json; charset=utf-8",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const renderBackend = "https://kharchapani-0lon.onrender.com/api/v1";
    let apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || renderBackend).trim().replace(/\/$/, "");
    if (apiBase.startsWith("http") && !apiBase.endsWith("/api/v1")) {
      apiBase = `${apiBase}/api/v1`;
    }
    const destinationUrl = apiBase.startsWith("http") ? `${apiBase}/:path*` : `${renderBackend}/:path*`;
    return [
      {
        source: "/api/v1/:path*",
        destination: destinationUrl,
      },
    ];
  },
};

module.exports = nextConfig;
