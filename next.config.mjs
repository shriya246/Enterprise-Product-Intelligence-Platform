import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// No-op (skips source map upload) until SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// are connected — client/server/edge error capture still works once
// NEXT_PUBLIC_SENTRY_DSN is set, independent of source map upload.
export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
});
