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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
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
      // Q-001: Ban unresolved work markers — all work must be tracked in issues, not code comments.
      "no-warning-comments": [
        "error",
        {
          terms: ["TODO", "FIXME", "HACK", "XXX"],
          location: "anywhere",
        },
      ],
      // Q-002: Ban demo-data and mock imports — production code must use Supabase hooks.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/demo-data*"],
              message:
                "Demo data imports are banned in production code. Use Supabase hooks instead.",
            },
            {
              group: ["**/mock*", "**/mocks*"],
              message:
                "Mock data imports are banned in production code. Use Supabase hooks instead.",
            },
          ],
        },
      ],
      // Q-003: Ban inline MOCK_ constant declarations — eliminates shadow data sources.
      "no-restricted-syntax": [
        "error",
        {
          selector: "VariableDeclarator[id.name=/^MOCK_/]",
          message:
            "Inline MOCK_ constants are banned. Use Supabase hooks for data fetching.",
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
  // Supabase Edge Functions run in Deno — console is the standard logging mechanism.
  {
    files: ["supabase/functions/**/*.ts"],
    rules: {
      "no-console": "off",
      "no-warning-comments": "off",
    },
  },
  // Q-001 override: Allow unresolved work markers in test files and config.
  {
    files: [
      "src/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "eslint.config.mjs",
    ],
    rules: {
      "no-warning-comments": "off",
    },
  },
  // Q-002 + Q-003 override: Demo-data definition files are the source, not consumers.
  {
    files: ["src/lib/demo-data*.ts"],
    rules: {
      "no-restricted-syntax": "off",
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
