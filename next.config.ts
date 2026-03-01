import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  ],
};

export default nextConfig;
