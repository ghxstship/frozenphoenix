/* ═══════════════════════════════════════════════════════════════
   ANALYTICS — FIND-038 Remediation
   ═══════════════════════════════════════════════════════════════
   
   Consent-gated analytics integration. Currently stubs PostHog.
   Only initializes when the user has granted analytics consent
   via the cookie consent banner (FIND-024).
   
   Usage:
     import { analytics } from "@/lib/analytics";
     analytics.capture("page_viewed", { path: "/dashboard" });
   ═══════════════════════════════════════════════════════════════ */

import { hasConsent } from "@/components/cookie-consent";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

interface AnalyticsProvider {
    init(): void;
    identify(userId: string, traits?: AnalyticsProperties): void;
    capture(event: string, properties?: AnalyticsProperties): void;
    page(name?: string, properties?: AnalyticsProperties): void;
    reset(): void;
}

// ─── PostHog stub ────────────────────────────────────────────
// Replace with actual PostHog SDK when ready:
//   npm install posthog-js
//   import posthog from "posthog-js";

let initialized = false;

function isEnabled(): boolean {
    return hasConsent("analytics");
}

function getPostHogKey(): string | undefined {
    if (typeof process !== "undefined") {
        return process.env.NEXT_PUBLIC_POSTHOG_KEY;
    }
    return undefined;
}

const posthogStub: AnalyticsProvider = {
    init() {
        if (initialized || !isEnabled()) return;
        const key = getPostHogKey();
        if (!key) return;

        // When PostHog SDK is installed, initialize here:
        // posthog.init(key, {
        //     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        //     loaded: (ph) => { if (!isEnabled()) ph.opt_out_capturing(); },
        //     capture_pageview: false, // We handle this manually
        //     capture_pageleave: true,
        //     persistence: "localStorage+cookie",
        // });

        initialized = true;
    },

    identify(userId: string, traits?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
        void userId;
        void traits;
        // posthog.identify(userId, traits);
    },

    capture(event: string, properties?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
        void event;
        void properties;
        // posthog.capture(event, properties);
    },

    page(name?: string, properties?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
        void name;
        void properties;
        // posthog.capture("$pageview", { ...properties, $current_url: window.location.href });
    },

    reset() {
        if (!initialized) return;
        // posthog.reset();
        initialized = false;
    },
};

// ─── Public API ──────────────────────────────────────────────
export const analytics: AnalyticsProvider = posthogStub;

// Listen for consent changes to initialize/teardown
if (typeof window !== "undefined") {
    window.addEventListener("cookie-consent-updated", ((e: CustomEvent) => {
        const consent = e.detail;
        if (consent?.analytics) {
            analytics.init();
        } else {
            analytics.reset();
        }
    }) as EventListener);
}
