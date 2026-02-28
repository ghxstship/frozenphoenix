"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthFormField, PasswordInput, OAuthButtons } from "@/components/auth";
import { validateRedirectUrl, checkRateLimit, recordFailedAttempt, resetRateLimit, formatLockoutTime, mapAuthError } from "@/lib/auth-utils";
import { Mail, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = validateRedirectUrl(searchParams.get("redirect"));

    const suspendedReason = searchParams.get("reason") === "account_suspended";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(
        suspendedReason ? "Your account has been suspended. Please contact your organization administrator." : null
    );
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const [lockoutMs, setLockoutMs] = useState(0);

    // Countdown timer for rate limiting
    useEffect(() => {
        if (lockoutMs <= 0) return;
        const timer = setInterval(() => {
            setLockoutMs((prev) => {
                const next = prev - 1000;
                if (next <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutMs]);

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Rate limit check
        const limit = checkRateLimit();
        if (!limit.allowed) {
            setLockoutMs(limit.retryAfterMs);
            setError(`Too many attempts. Try again in ${formatLockoutTime(limit.retryAfterMs)}.`);
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError("Authentication service unavailable. Please try again later.");
                return;
            }
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                recordFailedAttempt();
                const limit = checkRateLimit();
                if (!limit.allowed) {
                    setLockoutMs(limit.retryAfterMs);
                }
                setError(mapAuthError(authError.message));
                return;
            }

            resetRateLimit();
            router.push(redirectTo);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [email, password, redirectTo, router]);

    const handleOAuthLogin = useCallback(async (provider: "google" | "github") => {
        setError(null);
        setOauthLoading(provider);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError("Authentication service unavailable. Please try again later.");
                return;
            }

            const safeRedirect = validateRedirectUrl(redirectTo);
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`,
                },
            });

            if (oauthError) {
                setError(mapAuthError(oauthError.message));
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setOauthLoading(null);
        }
    }, [redirectTo]);

    const isLocked = lockoutMs > 0;
    const isDisabled = loading || isLocked;

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
                    fieldId="login-email"
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={isDisabled}
                />

                <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium leading-none">
                        Password
                    </label>
                    <PasswordInput
                        id="login-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={isDisabled}
                    />
                </div>

                <div className="flex items-center justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isDisabled}
                    aria-busy={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Signing in…
                        </>
                    ) : isLocked ? (
                        `Locked — ${formatLockoutTime(lockoutMs)}`
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>

            <OAuthButtons
                onOAuth={handleOAuthLogin}
                loading={oauthLoading}
                disabled={isDisabled}
            />

            <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
