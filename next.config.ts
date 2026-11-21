import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy
// In development, Webpack requires 'unsafe-eval' for source maps and ws: for HMR.
// In production, strictly enforces 'self' and PRD 8.4 requirements.
const cspDirectives = isDev
  ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws://localhost:* http://localhost:*; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';";

const securityHeaders = [
  // Only send HSTS in production over HTTPS (prevents broken SSL warnings on http://localhost)
  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  // Security headers on every response (PRD 8.4)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
