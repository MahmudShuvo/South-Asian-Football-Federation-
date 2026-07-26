import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /* Fail the production build on type errors. Explicit rather than relying on the
     default, so nobody flips it to `true` during a late-night deploy without
     noticing.

     Note: Next 16 removed the `eslint` config key along with `next lint`. Linting
     is now a standalone `eslint .` step, run by CI and by the pre-commit hook —
     which is better anyway, since it no longer couples lint failures to builds. */
  typescript: { ignoreBuildErrors: false },

  /* Transpile workspace packages: they ship raw TypeScript rather than a build
     step, which keeps the monorepo fast and avoids stale `dist` output. */
  transpilePackages: ["@saff/shared-types", "@saff/database"],

  /* AVIF before WebP. Roughly 20% smaller at the same quality, and image weight
     is the main threat to the 2s LCP target on throttled 4G. */
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  poweredByHeader: false,

  /* Security headers set here rather than at the edge so they apply identically
     on Vercel, Cloudflare, and a self-hosted container (ADR-013 keeps hosting
     portable). CSP is deliberately deferred until Day 14, when the real set of
     script and image origins is known — a guessed CSP gets disabled in a panic. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
