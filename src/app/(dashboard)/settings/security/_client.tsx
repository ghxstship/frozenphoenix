"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth";
import { mapAuthError, validatePassword } from "@/features/auth/utils/auth-utils";
import {
    AlertCircle,
    CheckCircle2,
    Key,
    Loader2,
    MonitorSmartphone,
    Plus,
    Shield,
    Smartphone,
    Trash2,
} from "lucide-react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

interface MfaFactor {
    id: string;
    friendly_name: string;
    factor_type: string;
    status: string;
    created_at: string;
}

interface ActiveSession {
    id: string;
    user_agent: string;
    ip: string;
    created_at: string;
}

export function SecuritySettingsPageClient() {
    const router = useRouter();
    const { user } = useAuth();

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState<string | null>(null);
    const [pwSuccess, setPwSuccess] = useState(false);

    // MFA state
    const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
    const [mfaLoading, setMfaLoading] = useState(true);
    const [mfaRemoving, setMfaRemoving] = useState<string | null>(null);
    const [mfaConfirmId, setMfaConfirmId] = useState<string | null>(null);

    // Sessions state
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // Fetch MFA factors
    useEffect(() => {
        async function fetchMfa() {
            try {
                const supabase = createClient();
                if (!supabase) return;

                const { data } = await supabase.auth.mfa.listFactors();
                if (data?.totp) {
                    setMfaFactors(
                        data.totp.map((f) => ({
                            id: f.id,
                            friendly_name: f.friendly_name || "Authenticator App",
                            factor_type: f.factor_type,
                            status: f.status,
                            created_at: f.created_at,
                        }))
                    );
                }
            } catch {
                // Non-blocking
            } finally {
                setMfaLoading(false);
            }
        }

        fetchMfa();
    }, []);

    // Fetch sessions (from login_audit_log if available)
    useEffect(() => {
        async function fetchSessions() {
            try {
                const supabase = createClient();
                if (!supabase || !user) return;

                const { data } = await supabase
                    .from("login_audit_log")
                    .select("id, user_agent, ip_address, created_at")
                    .eq("user_id", user.id)
                    .eq("event_type", "login_success")
                    .order("created_at", { ascending: false })
                    .limit(10);

                if (data) {
                    setSessions(
                        data.map((s: Record<string, unknown>) => ({
                            id: s.id as string,
                            user_agent: (s.user_agent as string) || "Unknown device",
                            ip: (s.ip_address as string) || "Unknown",
                            created_at: s.created_at as string,
                        }))
                    );
                }
            } catch {
                // Table may not exist yet — non-blocking
            } finally {
                setSessionsLoading(false);
            }
        }

        fetchSessions();
    }, [user]);

    const handlePasswordChange = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setPwError(null);
            setPwSuccess(false);

            const pwErr = validatePassword(newPassword);
            if (pwErr) {
                setPwError(pwErr);
                return;
            }

            if (newPassword !== confirmPassword) {
                setPwError("New passwords do not match.");
                return;
            }

            setPwLoading(true);

            try {
                const supabase = createClient();
                if (!supabase) {
                    setPwError("Authentication service unavailable.");
                    return;
                }

                // Re-authenticate with current password before allowing change
                const { error: reauthError } = await supabase.auth.signInWithPassword({
                    email: user?.email || "",
                    password: currentPassword,
                });

                if (reauthError) {
                    setPwError("Current password is incorrect.");
                    return;
                }

                const { error } = await supabase.auth.updateUser({
                    password: newPassword,
                });

                if (error) {
                    setPwError(mapAuthError(error.message));
                    return;
                }

                setPwSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } catch {
                setPwError("Something went wrong. Please try again.");
            } finally {
                setPwLoading(false);
            }
        },
        [currentPassword, newPassword, confirmPassword, user?.email]
    );

    const handleRemoveMfa = useCallback(async (factorId: string) => {
        setMfaRemoving(factorId);
        setMfaConfirmId(null);

        try {
            const supabase = createClient();
            if (!supabase) return;

            const { error } = await supabase.auth.mfa.unenroll({ factorId });

            if (!error) {
                setMfaFactors((prev) => prev.filter((f) => f.id !== factorId));
            }
        } catch {
            // Non-blocking
        } finally {
            setMfaRemoving(null);
        }
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const verifiedFactors = mfaFactors.filter((f) => f.status === "verified");

    const shellConfig: ListPageConfig = {
        entityKey: "security",
        resource: "security",
        title: "Security Settings",
        description: "Manage your password, two-factor authentication, and active sessions.",
        contentSlot: (
            <div className="density-gap-page max-w-2xl">
                {/* Password Change */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Key className="h-4 w-4" aria-hidden="true" />
                            Change Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handlePasswordChange}
                            className="density-gap-section"
                            noValidate
                        >
                            {pwError && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                    role="alert"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    {pwError}
                                </div>
                            )}
                            {pwSuccess && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
                                    role="status"
                                >
                                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Password updated successfully.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="current-pw" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <PasswordInput
                                    id="current-pw"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    disabled={pwLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-pw" className="text-sm font-medium">
                                    New Password
                                </Label>
                                <PasswordInput
                                    id="new-pw"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    showStrengthMeter
                                    disabled={pwLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-pw" className="text-sm font-medium">
                                    Confirm New Password
                                </Label>
                                <PasswordInput
                                    id="confirm-new-pw"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    disabled={pwLoading}
                                />
                            </div>
                            <Button type="submit" disabled={pwLoading} aria-busy={pwLoading}>
                                {pwLoading ? (
                                    <>
                                        <Loader2
                                            className="h-4 w-4 motion-safe:animate-spin"
                                            aria-hidden="true"
                                        />{" "}
                                        Updating…
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4" aria-hidden="true" />
                            Two-Factor Authentication
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="density-gap-section">
                        {mfaLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                            </div>
                        ) : verifiedFactors.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                                    <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Two-factor authentication is enabled.
                                </div>
                                {verifiedFactors.map((factor) => (
                                    <div
                                        key={factor.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Smartphone
                                                className="h-4 w-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {factor.friendly_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Added {formatDate(factor.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setMfaConfirmId(factor.id)}
                                            disabled={mfaRemoving === factor.id}
                                            aria-label={`Remove ${factor.friendly_name}`}
                                        >
                                            {mfaRemoving === factor.id ? (
                                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            )}
                                        </Button>
                                        {mfaConfirmId === factor.id && (
                                            <div
                                                className="flex items-center gap-2 mt-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                                                role="alertdialog"
                                                aria-label="Confirm MFA removal"
                                            >
                                                <p className="text-xs text-destructive flex-1">
                                                    Remove this factor? You will no longer need a
                                                    code to sign in.
                                                </p>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveMfa(factor.id)}
                                                    disabled={mfaRemoving === factor.id}
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setMfaConfirmId(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-4 space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security to your account with an
                                    authenticator app.
                                </p>
                                <Button onClick={() => router.push("/auth/mfa-setup")}>
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                    Enable Two-Factor Auth
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Login Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
                            Recent Login Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sessionsLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                            </div>
                        ) : sessions.length > 0 ? (
                            <ul className="space-y-2" role="list">
                                {sessions.map((session) => (
                                    <li
                                        key={session.id}
                                        className="flex items-center justify-between p-3 rounded-lg border text-sm"
                                    >
                                        <div>
                                            <p className="font-medium truncate max-w-xs">
                                                {session.user_agent}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip} · {formatDate(session.created_at)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent login activity recorded.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-4 w-4" aria-hidden="true" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{user?.email || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account created</span>
                            <span className="font-medium">
                                {user?.created_at ? formatDate(user.created_at) : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last sign in</span>
                            <span className="font-medium">
                                {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : "—"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        ),
    };

    return <ListPageShell config={shellConfig} />;
}
