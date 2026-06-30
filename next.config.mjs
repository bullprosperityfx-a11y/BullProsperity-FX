/** @type {import("next").NextConfig} */
const nextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/dashboard", destination: "/hub", permanent: true },
      { source: "/lesson:lessonId(\\d+)", destination: "/lesson/:lessonId", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
