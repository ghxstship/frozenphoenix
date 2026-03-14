"use client";

import React, { Suspense, useCallback, useState } from "react";
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
import { mapAuthError, validatePassword } from "@/lib/auth-utils";
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Loader2, Mail, User } from "lucide-react";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("invite");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const botProtection = useBotProtection();

    const validate = useCallback((): boolean => {
        const errors: Record<string, string> = {};
        if (!firstName.trim()) errors.firstName = "First name is required.";
        if (!lastName.trim()) errors.lastName = "Last name is required.";
        if (!email.trim()) errors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.email = "Please enter a valid email.";
        const pwError = validatePassword(password);
        if (pwError) errors.password = pwError;
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [firstName, lastName, email, password]);

    const handleSignup = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (!validate()) return;

            setLoading(true);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable. Please try again later.");
                    return;
                }

                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName.trim(),
                            last_name: lastName.trim(),
                            name: `${firstName.trim()} ${lastName.trim()}`,
                            org_name: orgName || undefined,
                            invite_token: inviteToken || undefined,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (authError) {
                    // Prevent email enumeration — always show generic message for
                    // "User already registered" errors
                    if (authError.message.toLowerCase().includes("already registered")) {
                        setSuccess(true);
                        return;
                    }
                    setError(mapAuthError(authError.message));
                    return;
                }

                // When autoconfirm is enabled, redirect to onboarding
                if (data?.session) {
                    router.push(inviteToken ? "/dashboard" : "/onboarding/org-setup");
                    return;
                }

                setSuccess(true);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [email, password, firstName, lastName, orgName, inviteToken, router, validate]
    );

    const handleOAuthLogin = useCallback(
        async (provider: "google" | "github") => {
            setError(null);
            setOauthLoading(provider);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable. Please try again later.");
                    return;
                }

                const callbackUrl = inviteToken
                    ? `${window.location.origin}/auth/callback?next=/invite/${inviteToken}`
                    : `${window.location.origin}/auth/callback?next=/onboarding/org-setup`;

                const { error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: { redirectTo: callbackUrl },
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
        [inviteToken]
    );

    if (success) {
        return (
            <AuthLayout title="Check your email" subtitle="One more step to get started">
                <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Confirmation link sent</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click
                            the link in the email to activate your account.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Didn&apos;t receive it? Check your spam folder or try again in a few
                            minutes.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to Sign In
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={inviteToken ? "Accept Invitation" : "Create your account"}
            subtitle={
                inviteToken
                    ? "Join your team on the platform"
                    : "Start managing productions in minutes"
            }
        >
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
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

                <div className="grid grid-cols-2 gap-3">
                    <AuthFormField
                        fieldId="signup-first-name"
                        label="First Name"
                        type="text"
                        icon={User}
                        placeholder="Alex"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            setFieldErrors((p) => ({ ...p, firstName: "" }));
                        }}
                        autoComplete="given-name"
                        error={fieldErrors.firstName}
                        required
                        disabled={loading}
                    />
                    <AuthFormField
                        fieldId="signup-last-name"
                        label="Last Name"
                        type="text"
                        placeholder="Rivera"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                            setFieldErrors((p) => ({ ...p, lastName: "" }));
                        }}
                        autoComplete="family-name"
                        error={fieldErrors.lastName}
                        required
                        disabled={loading}
                    />
                </div>

                <AuthFormField
                    fieldId="signup-email"
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    autoComplete="email"
                    error={fieldErrors.email}
                    required
                    disabled={loading}
                />

                <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium leading-none">
                        Password{" "}
                        <span className="text-destructive ml-1" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <PasswordInput
                        id="signup-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setFieldErrors((p) => ({ ...p, password: "" }));
                        }}
                        autoComplete="new-password"
                        showStrengthMeter
                        error={fieldErrors.password}
                        required
                        disabled={loading}
                    />
                    {fieldErrors.password && (
                        <p className="text-xs text-destructive" role="alert">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {!inviteToken && (
                    <AuthFormField
                        fieldId="signup-org"
                        label="Organization Name"
                        type="text"
                        icon={Building2}
                        placeholder="Acme Productions"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        description="Optional — you can set this up later."
                        disabled={loading}
                    />
                )}

                <BotProtection
                    onVerify={botProtection.onVerify}
                    onError={botProtection.onError}
                    onExpire={botProtection.onExpire}
                    action="signup"
                />

                <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Creating account…
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>
            </form>

            <OAuthButtons onOAuth={handleOAuthLogin} loading={oauthLoading} disabled={loading} />

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}

export default function SignupPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <SignupForm />
        </Suspense>
    );
}
