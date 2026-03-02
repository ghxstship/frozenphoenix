/* ═══════════════════════════════════════════════════════════════
   COOKIE CONSENT BANNER — FIND-024 Remediation
   ═══════════════════════════════════════════════════════════════
   
   GDPR/CCPA-compliant cookie consent banner. Classifies cookies
   into essential (always active) and analytics (opt-in).
   Persists consent to localStorage.
   
   Usage: Add <CookieConsent /> to the root layout or Providers.
   ═══════════════════════════════════════════════════════════════ */

"use client";

import React, { useCallback, useState } from "react";

export type ConsentCategory = "essential" | "analytics" | "functional";

interface ConsentState {
    essential: boolean; // Always true — auth cookies, CSRF
    analytics: boolean; // PostHog, GA, etc.
    functional: boolean; // Preferences, locale
    timestamp: string;
}

const CONSENT_KEY = "cookie_consent";

function getStoredConsent(): ConsentState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ConsentState;
    } catch {
        return null;
    }
}

function storeConsent(consent: ConsentState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function hasConsent(category: ConsentCategory): boolean {
    const consent = getStoredConsent();
    if (!consent) return category === "essential";
    return consent[category];
}

export function CookieConsent() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined") return false;
        return getStoredConsent() === null;
    });
    const [showDetails, setShowDetails] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [functional, setFunctional] = useState(true);

    const saveConsent = useCallback(
        (accept: "all" | "essential" | "custom") => {
            const consent: ConsentState = {
                essential: true,
                analytics: accept === "all" ? true : accept === "custom" ? analytics : false,
                functional: accept === "all" ? true : accept === "custom" ? functional : true,
                timestamp: new Date().toISOString(),
            };
            storeConsent(consent);
            setVisible(false);

            // Dispatch event so analytics providers can initialize
            window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));
        },
        [analytics, functional]
    );

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            aria-live="polite"
            className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
        >
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-lg p-6">
                <h2 className="text-base font-semibold text-foreground mb-2">Cookie Preferences</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    We use essential cookies for authentication and security. Analytics cookies help
                    us improve your experience and are only enabled with your consent.{" "}
                    <a href="/privacy" className="underline text-primary hover:text-primary/80">
                        Privacy Policy
                    </a>
                </p>

                {showDetails && (
                    <div className="mb-4 space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked
                                disabled
                                className="rounded"
                                aria-label="Essential cookies (always active)"
                            />
                            <span>
                                <strong className="text-foreground">Essential</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Authentication, security, CSRF (always active)
                                </span>
                            </span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={functional}
                                onChange={(e) => setFunctional(e.target.checked)}
                                className="rounded"
                                aria-label="Functional cookies"
                            />
                            <span>
                                <strong className="text-foreground">Functional</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Preferences, locale, theme
                                </span>
                            </span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={analytics}
                                onChange={(e) => setAnalytics(e.target.checked)}
                                className="rounded"
                                aria-label="Analytics cookies"
                            />
                            <span>
                                <strong className="text-foreground">Analytics</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Usage data to improve the product
                                </span>
                            </span>
                        </label>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => saveConsent("all")}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() =>
                            showDetails ? saveConsent("custom") : saveConsent("essential")
                        }
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        {showDetails ? "Save Preferences" : "Essential Only"}
                    </button>
                    {!showDetails && (
                        <button
                            onClick={() => setShowDetails(true)}
                            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                        >
                            Customize
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
