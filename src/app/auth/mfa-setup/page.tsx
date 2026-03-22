"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth";
import { mapAuthError } from "@/features/auth/utils/auth-utils";
import { csrfHeaders } from "@/lib/security/csrf";
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    Copy,
    Download,
    Loader2,
    ShieldCheck,
} from "lucide-react";

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
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [codesAcknowledged, setCodesAcknowledged] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrError, setQrError] = useState(false);

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

    const handleVerify = useCallback(
        async (e: React.FormEvent) => {
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

                const { data: challenge, error: challengeError } =
                    await supabase.auth.mfa.challenge({
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

                // Generate recovery codes after successful verification
                try {
                    const res = await fetch("/api/auth/mfa-recovery-codes", {
                        method: "POST",
                        headers: csrfHeaders(),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.codes) setRecoveryCodes(data.codes);
                    }
                } catch {
                    // Recovery codes are best-effort — don't block MFA success
                }

                setSuccess(true);
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setVerifying(false);
            }
        },
        [verifyCode, enrollment]
    );

    const copySecret = useCallback(() => {
        if (!enrollment?.totp.secret) return;
        navigator.clipboard.writeText(enrollment.totp.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [enrollment]);

    const downloadRecoveryCodes = useCallback(() => {
        const content = [
            "FrozenPhoenix MFA Recovery Codes",
            `Generated: ${new Date().toISOString()}`,
            "",
            "Each code can only be used once.",
            "Store these codes in a safe place.",
            "",
            ...recoveryCodes.map((code, i) => `${i + 1}. ${code}`),
        ].join("\n");

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "frozenphoenix-recovery-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
    }, [recoveryCodes]);

    if (success) {
        // Show recovery codes first, then allow navigating to dashboard
        if (recoveryCodes.length > 0 && !codesAcknowledged) {
            return (
                <AuthLayout
                    title="Save your recovery codes"
                    subtitle="These codes can be used if you lose access to your authenticator"
                >
                    <div className="density-gap-section py-2">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>Save these codes now. They won&apos;t be shown again.</span>
                        </div>
                        <div
                            className="grid grid-cols-1 gap-2 p-4 bg-muted rounded-xl sm:grid-cols-2"
                            role="list"
                            aria-label="Recovery codes"
                        >
                            {recoveryCodes.map((code, i) => (
                                <code
                                    key={i}
                                    role="listitem"
                                    className="text-sm font-mono tracking-wider text-center py-1.5 px-2 bg-background rounded-lg border"
                                >
                                    {code}
                                </code>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={downloadRecoveryCodes}
                            >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    navigator.clipboard.writeText(recoveryCodes.join("\n"));
                                }}
                            >
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                Copy All
                            </Button>
                        </div>
                        <Button className="w-full" onClick={() => setCodesAcknowledged(true)}>
                            I&apos;ve saved these codes
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </AuthLayout>
            );
        }

        return (
            <AuthLayout title="MFA enabled" subtitle="Your account is now more secure">
                <div
                    className="text-center density-gap-section py-4"
                    role="status"
                    aria-live="polite"
                >
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                            Two-factor authentication is active
                        </h2>
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
        <AuthLayout
            title="Set up two-factor authentication"
            subtitle="Add an extra layer of security to your account"
        >
            <div className="density-gap-page">
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
                        <Loader2 className="h-8 w-8 motion-safe:animate-spin text-primary" />
                    </div>
                ) : enrollment ? (
                    <>
                        {/* Step 1: Scan QR */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    1
                                </span>
                                Scan this QR code with your authenticator app
                            </div>
                            <div className="flex justify-center p-4 bg-white rounded-xl">
                                {qrError ? (
                                    <div className="w-48 h-48 flex items-center justify-center text-center p-4">
                                        <p className="text-sm text-muted-foreground">
                                            QR code failed to load. Use the secret key below to set
                                            up your authenticator manually.
                                        </p>
                                    </div>
                                ) : (
                                    /* Data URI from Supabase TOTP enrollment — not optimizable by next/image */
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={enrollment.totp.qr_code}
                                        alt="MFA QR Code — scan with your authenticator app"
                                        className="w-48 h-48"
                                        onError={() => setQrError(true)}
                                    />
                                )}
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
                                        aria-label={
                                            copied ? "Secret key copied" : "Copy secret key"
                                        }
                                    >
                                        {copied ? (
                                            <Check
                                                className="h-3 w-3 text-success"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Copy className="h-3 w-3" aria-hidden="true" />
                                        )}
                                    </Button>
                                    <span className="sr-only" aria-live="polite">
                                        {copied ? "Secret key copied to clipboard" : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Verify */}
                        <form onSubmit={handleVerify} className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    2
                                </span>
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
                                    onChange={(e) =>
                                        setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
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
                                        <Loader2
                                            className="h-4 w-4 motion-safe:animate-spin"
                                            aria-hidden="true"
                                        />
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
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 motion-safe:animate-spin text-primary" />
                </div>
            }
        >
            <MfaSetupForm />
        </Suspense>
    );
}
