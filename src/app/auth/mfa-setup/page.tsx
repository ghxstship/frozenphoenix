"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth";
import { mapAuthError } from "@/lib/auth-utils";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Copy, Check } from "lucide-react";

interface MfaEnrollment {
    id: string;
    type: "totp";
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

function MfaSetupForm() {
    const router = useRouter();

    const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    // Enroll MFA on mount
    useEffect(() => {
        async function enroll() {
            try {
                const supabase = createClient();
                if (!supabase) {
                    setError("Authentication service unavailable.");
                    setLoading(false);
                    return;
                }

                const { data, error: enrollError } = await supabase.auth.mfa.enroll({
                    factorType: "totp",
                    friendlyName: "Authenticator App",
                });

                if (enrollError) {
                    setError(mapAuthError(enrollError.message));
                    setLoading(false);
                    return;
                }

                setEnrollment(data as MfaEnrollment);
            } catch {
                setError("Failed to set up MFA. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        enroll();
    }, []);

    const handleVerify = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!verifyCode.trim() || verifyCode.length !== 6) {
            setError("Please enter a 6-digit code from your authenticator app.");
            return;
        }

        if (!enrollment) return;

        setVerifying(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError("Authentication service unavailable.");
                return;
            }

            const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: enrollment.id,
            });

            if (challengeError) {
                setError(mapAuthError(challengeError.message));
                return;
            }

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: enrollment.id,
                challengeId: challenge.id,
                code: verifyCode,
            });

            if (verifyError) {
                setError("Invalid code. Please check your authenticator app and try again.");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setVerifying(false);
        }
    }, [verifyCode, enrollment]);

    const copySecret = useCallback(() => {
        if (!enrollment?.totp.secret) return;
        navigator.clipboard.writeText(enrollment.totp.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [enrollment]);

    if (success) {
        return (
            <AuthLayout title="MFA enabled" subtitle="Your account is now more secure">
                <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Two-factor authentication is active</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            You&apos;ll need your authenticator app each time you sign in.
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
        <AuthLayout title="Set up two-factor authentication" subtitle="Add an extra layer of security to your account">
            <div className="space-y-6">
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

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : enrollment ? (
                    <>
                        {/* Step 1: Scan QR */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                                Scan this QR code with your authenticator app
                            </div>
                            <div className="flex justify-center p-4 bg-white rounded-xl">
                                <img
                                    src={enrollment.totp.qr_code}
                                    alt="MFA QR Code — scan with your authenticator app"
                                    className="w-48 h-48"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Or enter this secret key manually:
                                </p>
                                <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                                    <code className="text-xs font-mono tracking-widest select-all">
                                        {enrollment.totp.secret}
                                    </code>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={copySecret}
                                        aria-label="Copy secret key"
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3 text-success" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Verify */}
                        <form onSubmit={handleVerify} className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                                Enter the 6-digit code to verify
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    id="mfa-code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    autoComplete="one-time-code"
                                    className="text-center text-lg font-mono tracking-[0.5em] flex-1"
                                    aria-label="6-digit verification code"
                                    disabled={verifying}
                                />
                                <Button
                                    type="submit"
                                    disabled={verifying || verifyCode.length !== 6}
                                    aria-busy={verifying}
                                >
                                    {verifying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                        "Verify"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </>
                ) : null}

                <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                >
                    I&apos;ll set this up later
                </Button>
            </div>
        </AuthLayout>
    );
}

export default function MfaSetupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <MfaSetupForm />
        </Suspense>
    );
}
