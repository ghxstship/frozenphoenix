"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth";
import { mapAuthError } from "@/lib/auth-utils";
import { csrfHeaders } from "@/lib/csrf";
import { AlertCircle, Loader2, Shield } from "lucide-react";

function MfaVerifyForm() {
    const router = useRouter();

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const codeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Delay focus so screen readers can announce the page heading first
        const timer = setTimeout(() => codeInputRef.current?.focus(), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleVerify = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (!code.trim() || code.length !== 6) {
                setError("Please enter a 6-digit code from your authenticator app.");
                return;
            }

            setLoading(true);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable.");
                    return;
                }

                // Get the user's TOTP factor
                const { data: factorsData, error: factorsError } =
                    await supabase.auth.mfa.listFactors();

                if (factorsError) {
                    setError(mapAuthError(factorsError.message));
                    return;
                }

                const totpFactor = factorsData?.totp?.[0];

                if (!totpFactor) {
                    setError("No MFA factor found. Please set up MFA first.");
                    return;
                }

                // Create a challenge
                const { data: challenge, error: challengeError } =
                    await supabase.auth.mfa.challenge({
                        factorId: totpFactor.id,
                    });

                if (challengeError) {
                    setError(mapAuthError(challengeError.message));
                    return;
                }

                // Verify the challenge
                const { error: verifyError } = await supabase.auth.mfa.verify({
                    factorId: totpFactor.id,
                    challengeId: challenge.id,
                    code,
                });

                if (verifyError) {
                    setError("Invalid code. Please check your authenticator app and try again.");
                    return;
                }

                // Invalidate middleware cache cookies so the next request
                // goes through the slow path and sees the new AAL2 level.
                // Without this, the stale fp-mfa-level=needs_aal2 cookie
                // causes an infinite redirect loop back to this page.
                const cacheCookies = [
                    "fp-mfa-level",
                    "fp-user-role",
                    "fp-org-id",
                    "fp-lifecycle-status",
                    "fp-onboarding-complete",
                ];
                for (const name of cacheCookies) {
                    document.cookie = `${name}=; path=/; max-age=0`;
                }

                router.push("/dashboard");
                router.refresh();
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [code, router]
    );

    return (
        <AuthLayout
            title="Two-factor authentication"
            subtitle="Enter the code from your authenticator app"
        >
            <form onSubmit={handleVerify} className="space-y-5" noValidate>
                {error && (
                    <div
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                )}

                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                        <Shield className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="mfa-verify-code"
                        className="text-sm font-medium leading-none text-center block"
                    >
                        Verification Code
                    </label>
                    <Input
                        ref={codeInputRef}
                        id="mfa-verify-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        autoComplete="one-time-code"
                        className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                        aria-label="6-digit verification code"
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                        Open your authenticator app to view your code.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || code.length !== 6}
                    aria-busy={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Verifying…
                        </>
                    ) : (
                        "Verify & Continue"
                    )}
                </Button>
            </form>

            <div className="text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        try {
                            await fetch("/api/auth/signout", {
                                method: "POST",
                                headers: csrfHeaders(),
                            });
                        } catch {
                            // Best-effort
                        }
                        // Clear persisted org preference and middleware cache
                        // cookies to prevent state leak to the next user.
                        try {
                            localStorage.removeItem("fp-active-org-id");
                            const cacheCookies = [
                                "fp-mfa-level",
                                "fp-user-role",
                                "fp-org-id",
                                "fp-lifecycle-status",
                                "fp-onboarding-complete",
                                "fp-onboarding-skipped",
                            ];
                            for (const name of cacheCookies) {
                                document.cookie = `${name}=; path=/; max-age=0`;
                            }
                        } catch {
                            // localStorage/cookies may be unavailable
                        }
                        const supabase = createClient();
                        if (supabase) await supabase.auth.signOut();
                        window.location.href = "/login";
                    }}
                    className="text-xs text-muted-foreground"
                >
                    Sign in with a different account
                </Button>
            </div>
        </AuthLayout>
    );
}

export default function MfaVerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <MfaVerifyForm />
        </Suspense>
    );
}
