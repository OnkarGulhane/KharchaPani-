/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  transpilePackages: ["recharts"],
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    const cleanBase = apiBase.replace(/\/$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${cleanBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
