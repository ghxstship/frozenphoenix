import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // H-008: Required for Docker standalone build (Dockerfile copies .next/standalone)
    output: "standalone",
    reactCompiler: true,
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
            ],
        },
        {
            source: "/api/:path*",
            headers: [
                {
                    key: "X-Robots-Tag",
                    value: "noindex, nofollow",
                },
            ],
        },
    ],
};

export default nextConfig;
