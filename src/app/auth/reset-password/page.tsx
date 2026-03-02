"use client";

import React, { Suspense, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthLayout, PasswordInput } from "@/components/auth";
import { mapAuthError, validatePassword } from "@/lib/auth-utils";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpdatePassword = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setConfirmError(null);

            const pwError = validatePassword(password);
            if (pwError) {
                setError(pwError);
                return;
            }

            if (password !== confirmPassword) {
                setConfirmError("Passwords do not match.");
                return;
            }

            setLoading(true);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable. Please try again later.");
                    return;
                }

                const { error: updateError } = await supabase.auth.updateUser({
                    password,
                });

                if (updateError) {
                    setError(mapAuthError(updateError.message));
                    return;
                }

                setSuccess(true);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [password, confirmPassword]
    );

    if (success) {
        return (
            <AuthLayout
                title="Password updated"
                subtitle="Your account is secured with your new password"
            >
                <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">You&apos;re all set</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Your password has been successfully updated. You can now continue to
                            your dashboard.
                        </p>
                    </div>
                    <Button onClick={() => router.push("/dashboard")}>
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
            <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
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

                <div className="space-y-2">
                    <label htmlFor="reset-password" className="text-sm font-medium leading-none">
                        New Password{" "}
                        <span className="text-destructive ml-1" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <PasswordInput
                        id="reset-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        showStrengthMeter
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="reset-confirm" className="text-sm font-medium leading-none">
                        Confirm Password{" "}
                        <span className="text-destructive ml-1" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <PasswordInput
                        id="reset-confirm"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setConfirmError(null);
                        }}
                        autoComplete="new-password"
                        showIcon={false}
                        error={confirmError ?? undefined}
                        required
                        disabled={loading}
                    />
                    {confirmError && (
                        <p className="text-xs text-destructive" role="alert">
                            {confirmError}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Updating…
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
