import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // H-008: Required for Docker standalone build (Dockerfile copies .next/standalone)
    output: "standalone",
    reactCompiler: true,
    compress: true,

    // FIX: Turbopack barrel-file resolution for lucide-react (1500+ icon exports).
    // Without this, Turbopack may fail to instantiate individual icon modules
    // during HMR, causing "module factory not available" client-side errors.
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },

    // Performance: Keep server-only packages out of client bundles.
    // AI SDKs (~175KB combined), tiktoken (1.2MB WASM), doc parsers (~90KB).
    serverExternalPackages: [
        "@anthropic-ai/sdk",
        "openai",
        "@google/generative-ai",
        "@mistralai/mistralai",
        "groq-sdk",
        "ollama",
        "tiktoken",
        "pdf-parse",
        "mammoth",
    ],

    // Image optimization: prefer AVIF (smaller) with WebP fallback
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 86400,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },

    // FIND-023: CSP is authoritatively defined in src/lib/supabase/middleware.ts
    // to allow dynamic Supabase domain injection. Only non-CSP headers here.
    headers: async () => [
        {
            source: "/(.*)",
            headers: [
                {
                    key: "X-DNS-Prefetch-Control",
                    value: "on",
                },
                {
                    key: "X-Content-Type-Options",
                    value: "nosniff",
                },
                {
                    key: "X-Frame-Options",
                    value: "DENY",
                },
                {
                    key: "Referrer-Policy",
                    value: "strict-origin-when-cross-origin",
                },
                {
                    key: "Permissions-Policy",
                    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
                },
                {
                    key: "Strict-Transport-Security",
                    value: "max-age=31536000; includeSubDomains; preload",
                },
            ],
        },
        {
            source: "/api/:path*",
            headers: [
                {
                    key: "X-Robots-Tag",
                    value: "noindex, nofollow",
                },
                {
                    // Performance: Browser-level cache for API GET responses.
                    // 60s max-age aligns with React Query's staleTime.
                    // SWR for 5 min allows serving stale while revalidating.
                    key: "Cache-Control",
                    value: "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
                },
            ],
        },
    ],
};

export default nextConfig;
