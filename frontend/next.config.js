/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  transpilePackages: ["recharts"],
  async rewrites() {
    const renderBackend = "https://kharchapani-0lon.onrender.com/api/v1";
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || renderBackend;
    const cleanBase = apiBase.replace(/\/$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: cleanBase.startsWith("http") ? `${cleanBase}/:path*` : `${renderBackend}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
