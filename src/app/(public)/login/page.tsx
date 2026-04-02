"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
} from "@/features/auth/utils/auth-utils";
import { signInWithMagicLink } from "@/lib/supabase/auth-actions";
import { logAuthEvent } from "@/lib/supabase/auth-audit";
import { AlertCircle, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/locale-provider";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation("auth");
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
                    setError(t("common.serviceUnavailable"));
                    return;
                }
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                    ...(botProtection.token
                        ? { options: { captchaToken: botProtection.token } }
                        : {}),
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
                setError(t("common.error"));
            } finally {
                setLoading(false);
            }
        },
        [email, password, redirectTo, router, botProtection.token, t]
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
            setError(t("login.magicLinkPrompt"));
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
    }, [email, redirectTo, t]);

    const isLocked = lockoutMs > 0;
    const isDisabled = loading || isLocked;

    return (
        <AuthLayout title={t("login.title")} subtitle={t("login.subtitle")}>
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
                    label={t("login.emailLabel")}
                    type="email"
                    icon={Mail}
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={isDisabled}
                />

                <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium leading-none">
                        {t("login.passwordLabel")}
                    </Label>
                    <PasswordInput
                        id="login-password"
                        placeholder={t("login.passwordPlaceholder")}
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
                        {t("login.forgotPasswordLink")}
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
                            {t("login.submittingButton")}
                        </>
                    ) : isLocked ? (
                        `Locked — ${formatLockoutTime(lockoutMs)}`
                    ) : (
                        t("login.submitButton")
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
                    {t("login.magicLinkSent")}
                </div>
            ) : (
                <div className="text-center">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleMagicLink}
                        disabled={isDisabled || magicLinkLoading}
                        className="gap-1.5 text-sm text-muted-foreground"
                    >
                        {magicLinkLoading ? (
                            <Loader2
                                className="h-3.5 w-3.5 motion-safe:animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {t("login.magicLinkButton")}
                    </Button>
                </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
                {t("login.signupPrompt")}{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                    {t("login.signupLink")}
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
