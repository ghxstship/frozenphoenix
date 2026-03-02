import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // H-010: Ban direct console usage — use @/lib/logger instead.
  // Allowed in: logger.ts (infrastructure), env.ts (pre-logger bootstrap), config.ts (startup warnings).
  // M-002: Enforce import ordering (members within a single import statement).
  {
    rules: {
      "no-console": "warn",
      "sort-imports": [
        "warn",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: true,
        },
      ],
    },
  },
  {
    files: [
      "src/lib/logger.ts",
      "src/lib/env.ts",
      "src/lib/supabase/config.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // L-005: Exclude generated Supabase types (500KB+, deoptimizes ESLint).
  {
    files: ["src/lib/supabase/database.types.ts"],
    rules: {
      // Disable all rules on auto-generated file
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // L-005: Generated Supabase types
    "src/lib/supabase/database.types.ts",
  ]),
]);

export default eslintConfig;
