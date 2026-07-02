/** @type {import("next").NextConfig} */
const nextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  async rewrites() {
    const legacyPages = [
      "404",
      "500",
      "admin-signals",
      "ai-review",
      "broker",
      "buy-side",
      "checklist",
      "community",
      "course",
      "dashboard",
      "datenschutz",
      "entry-models",
      "hub-preview",
      "hub",
      "impressum",
      "journal",
      "liquidity",
      "live-setups",
      "locked",
      "longterm-sales",
      "longterm",
      "lot-size",
      "market-structure",
      "motivation-disziplin",
      "office-hours",
      "performance-lab",
      "replay",
      "risikohinweis",
      "setup-austausch",
      "setup-room",
      "setup",
      "status",
      "test",
      "thank-you",
      "tools",
      "trade-review",
      "tradingview",
      "waitlist"
    ];

    return {
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        { source: "/index", destination: "/index.html" },
        ...legacyPages.map((page) => ({
          source: `/${page}`,
          destination: `/${page}.html`
        })),
        { source: "/lesson:lessonId(\\d+)", destination: "/lesson:lessonId.html" },
        { source: "/admin/:page", destination: "/admin/:page.html" }
      ]
    };
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/hub", permanent: true }
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
