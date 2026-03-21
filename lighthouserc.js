/** @type {import('@lhci/cli').YargsArg.LhciConfig} */
module.exports = {
    ci: {
        collect: {
            // Collect against a running dev/preview server
            startServerCommand: "npm run start",
            startServerReadyPattern: "Ready",
            startServerReadyTimeout: 30_000,
            url: [
                "http://localhost:3000/",
                "http://localhost:3000/login",
                "http://localhost:3000/signup",
            ],
            numberOfRuns: 3,
            settings: {
                // Mobile throttling for realistic performance testing
                preset: "desktop",
                throttling: {
                    rttMs: 40,
                    throughputKbps: 10_240,
                    cpuSlowdownMultiplier: 1,
                },
            },
        },
        assert: {
            assertions: {
                // Performance
                "categories:performance": ["error", { minScore: 0.9 }],
                // Accessibility
                "categories:accessibility": ["error", { minScore: 0.95 }],
                // Best Practices
                "categories:best-practices": ["error", { minScore: 0.95 }],
                // SEO (public pages only)
                "categories:seo": ["warn", { minScore: 0.9 }],
                // Core Web Vitals assertions
                "first-contentful-paint": ["warn", { maxNumericValue: 2500 }],
                "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
                "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
                "total-blocking-time": ["error", { maxNumericValue: 600 }],
                "interactive": ["warn", { maxNumericValue: 5000 }],
            },
        },
        upload: {
            target: "temporary-public-storage",
        },
    },
};
