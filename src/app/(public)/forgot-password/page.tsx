"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthFormField, AuthLayout, BotProtection, useBotProtection } from "@/components/auth";
import { mapAuthError } from "@/lib/auth-utils";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const botProtection = useBotProtection();

    const handleReset = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (!email.trim()) {
                setError("Please enter your email address.");
                return;
            }

            setLoading(true);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable. Please try again later.");
                    return;
                }

                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                });

                if (resetError) {
                    setError(mapAuthError(resetError.message));
                    return;
                }

                // Always show success to prevent email enumeration
                setSuccess(true);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [email]
    );

    const handleResend = useCallback(() => {
        if (cooldown > 0) return;
        setCooldown(60);
        setSuccess(false);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [cooldown]);

    if (success) {
        return (
            <AuthLayout title="Check your email" subtitle="Password reset instructions sent">
                <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Reset link sent</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                            password reset link. Check your inbox and spam folder.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResend}
                            disabled={cooldown > 0}
                        >
                            {cooldown > 0
                                ? `Resend in ${cooldown}s`
                                : "Didn\u2019t receive it? Resend"}
                        </Button>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Back to Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we\u2019ll send you a reset link"
        >
            <form onSubmit={handleReset} className="space-y-4" noValidate>
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

                <AuthFormField
                    fieldId="forgot-email"
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={loading}
                />

                <BotProtection
                    onVerify={botProtection.onVerify}
                    onError={botProtection.onError}
                    onExpire={botProtection.onExpire}
                    action="forgot-password"
                />

                <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Sending…
                        </>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                    <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    Back to Sign In
                </Link>
            </div>
        </AuthLayout>
    );
}
