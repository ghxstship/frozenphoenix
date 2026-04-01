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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEscapeKey, useFocusReturn, useFocusTrap } from "@/hooks/use-accessibility";

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

    const trapRef = useFocusTrap(visible);
    useFocusReturn();
    useEscapeKey(() => saveConsent("essential"), visible);

    if (!visible) return null;

    return (
        <div
            ref={trapRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-label="Cookie consent"
            className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
        >
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-lg p-6">
                <h2 className="text-base font-semibold text-foreground mb-2">Cookie Preferences</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    We use essential cookies for authentication and security. Analytics cookies help
                    us improve your experience and are only enabled with your consent.{" "}
                    <Link
                        href="/legal/privacy"
                        className="underline text-primary hover:text-primary/80"
                    >
                        Privacy Policy
                    </Link>
                </p>

                {showDetails && (
                    <div className="mb-4 space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked
                                disabled
                                aria-label="Essential cookies (always active)"
                            />
                            <Label variant="muted">
                                <strong className="text-foreground">Essential</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Authentication, security, CSRF (always active)
                                </span>
                            </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={functional}
                                onCheckedChange={(checked) => setFunctional(checked === true)}
                                aria-label="Functional cookies"
                            />
                            <Label variant="muted">
                                <strong className="text-foreground">Functional</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Preferences, locale, theme
                                </span>
                            </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={analytics}
                                onCheckedChange={(checked) => setAnalytics(checked === true)}
                                aria-label="Analytics cookies"
                            />
                            <Label variant="muted">
                                <strong className="text-foreground">Analytics</strong>{" "}
                                <span className="text-muted-foreground">
                                    — Usage data to improve the product
                                </span>
                            </Label>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => saveConsent("all")}>Accept All</Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            showDetails ? saveConsent("custom") : saveConsent("essential")
                        }
                    >
                        {showDetails ? "Save Preferences" : "Essential Only"}
                    </Button>
                    {!showDetails && (
                        <Button variant="link" onClick={() => setShowDetails(true)}>
                            Customize
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
