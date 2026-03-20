"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    AuthFormField,
    AuthLayout,
    BotProtection,
    OAuthButtons,
    PasswordInput,
    useBotProtection,
} from "@/components/auth";
import {
    checkRateLimit,
    formatLockoutTime,
    mapAuthError,
    recordFailedAttempt,
    resetRateLimit,
    validateRedirectUrl,
} from "@/lib/auth-utils";
import { signInWithMagicLink } from "@/lib/supabase/auth-actions";
import { logAuthEvent } from "@/lib/supabase/auth-audit";
import { AlertCircle, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = validateRedirectUrl(searchParams.get("redirect"));

    const suspendedReason = searchParams.get("reason") === "account_suspended";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(
        suspendedReason
            ? "Your account has been suspended. Please contact your organization administrator."
            : null
    );
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const [lockoutMs, setLockoutMs] = useState(0);
    const [magicLinkLoading, setMagicLinkLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const botProtection = useBotProtection();
    const emailRef = useRef<HTMLInputElement>(null);

    // Auto-focus email field (delayed so screen readers announce heading first)
    useEffect(() => {
        const timer = setTimeout(() => emailRef.current?.focus(), 300);
        return () => clearTimeout(timer);
    }, []);

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

    const handleLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            // Rate limit check
            const limit = checkRateLimit();
            if (!limit.allowed) {
                setLockoutMs(limit.retryAfterMs);
                setError(
                    `Too many attempts. Try again in ${formatLockoutTime(limit.retryAfterMs)}.`
                );
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
                    options: botProtection.token
                        ? { captchaToken: botProtection.token }
                        : undefined,
                });

                if (authError) {
                    recordFailedAttempt();
                    logAuthEvent("login_failure", { email, reason: authError.message });
                    const limit = checkRateLimit();
                    if (!limit.allowed) {
                        setLockoutMs(limit.retryAfterMs);
                    }
                    setError(mapAuthError(authError.message));
                    return;
                }

                resetRateLimit();
                router.push(redirectTo);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [email, password, redirectTo, router, botProtection.token]
    );

    const handleOAuthLogin = useCallback(
        async (provider: "google") => {
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
        },
        [redirectTo]
    );

    const handleBlueskyLogin = useCallback(async (handle: string) => {
        setError(null);
        setOauthLoading("bluesky");

        try {
            const res = await fetch("/api/auth/bluesky/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to initiate Bluesky login.");
                return;
            }

            // Redirect to the AT Protocol authorization server
            window.location.href = data.redirectUrl;
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setOauthLoading(null);
        }
    }, []);

    const handleMagicLink = useCallback(async () => {
        if (!email) {
            setError("Enter your email address to receive a sign-in link.");
            return;
        }
        setError(null);
        setMagicLinkLoading(true);
        try {
            const safeRedirect = validateRedirectUrl(redirectTo);
            const { error: mlError } = await signInWithMagicLink(
                email,
                `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`
            );
            if (mlError) {
                setError(mapAuthError(mlError.message));
                return;
            }
            setMagicLinkSent(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setMagicLinkLoading(false);
        }
    }, [email, redirectTo]);

    const isLocked = lockoutMs > 0;
    const isDisabled = loading || isLocked;

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
            <form onSubmit={handleLogin} className="density-gap-section" noValidate>
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
                    ref={emailRef}
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

                <BotProtection
                    onVerify={botProtection.onVerify}
                    onError={botProtection.onError}
                    onExpire={botProtection.onExpire}
                    action="login"
                />

                <Button type="submit" className="w-full" disabled={isDisabled} aria-busy={loading}>
                    {loading ? (
                        <>
                            <Loader2
                                className="h-4 w-4 motion-safe:animate-spin"
                                aria-hidden="true"
                            />
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
                onBluesky={handleBlueskyLogin}
                loading={oauthLoading}
                disabled={isDisabled}
            />

            {magicLinkSent ? (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Check your email for a sign-in link.
                </div>
            ) : (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleMagicLink}
                        disabled={isDisabled || magicLinkLoading}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {magicLinkLoading ? (
                            <Loader2
                                className="h-3.5 w-3.5 motion-safe:animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        Sign in with email link instead
                    </button>
                </div>
            )}

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
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 motion-safe:animate-spin text-primary" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
