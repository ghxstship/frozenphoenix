/* ═══════════════════════════════════════════════════════════════
   ANALYTICS — Consent-gated Provider
   STATUS: NO-OP — Awaiting PostHog (or equivalent) integration
   
   When ready to activate:
   1. Install posthog-js: `npm install posthog-js`
   2. Initialize in init() with NEXT_PUBLIC_POSTHOG_KEY
   3. Wire identify/capture/page/reset to posthog SDK calls
   
   All call-sites already use this module — no import changes needed.
   ═══════════════════════════════════════════════════════════════ */

import { hasConsent } from "@/components/app/cookie-consent";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

interface AnalyticsProvider {
    init(): void;
    identify(userId: string, traits?: AnalyticsProperties): void;
    capture(event: string, properties?: AnalyticsProperties): void;
    page(name?: string, properties?: AnalyticsProperties): void;
    reset(): void;
}

// ─── No-op Provider ──────────────────────────────────────────

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

const noOpProvider: AnalyticsProvider = {
    init() {
        if (initialized || !isEnabled()) return;
        if (!getPostHogKey()) return;
        initialized = true;
    },

    identify(_userId: string, _traits?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
    },

    capture(_event: string, _properties?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
    },

    page(_name?: string, _properties?: AnalyticsProperties) {
        if (!isEnabled() || !initialized) return;
    },

    reset() {
        if (!initialized) return;
        initialized = false;
    },
};

// ─── Public API ──────────────────────────────────────────────
export const analytics: AnalyticsProvider = noOpProvider;

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
