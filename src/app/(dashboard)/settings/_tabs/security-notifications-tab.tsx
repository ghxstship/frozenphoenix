"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/supabase/auth-context";
import {
    useNotificationPreferences,
    useRevokeSession,
    useUpsertNotificationPreferences,
    useUserSessions,
} from "@/lib/settings/hooks";
import { Bell, Key, LogOut, Mail, Monitor, Shield, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// ─── Notifications Tab ───────────────────────────────────────────

interface NotificationsTabProps {
    settingsLoading: boolean;
    settingsContent: React.ReactNode;
}

export function NotificationsTab({ settingsLoading, settingsContent }: NotificationsTabProps) {
    const { user } = useAuth();
    const { data: notifPrefs } = useNotificationPreferences(user?.id ?? null);
    const upsertNotifPrefs = useUpsertNotificationPreferences();

    const handleNotifToggle = useCallback(
        (channel: string, enabled: boolean) => {
            if (!user?.id) return;
            upsertNotifPrefs.mutate({
                user_id: user.id,
                [channel]: enabled,
            });
        },
        [user?.id, upsertNotifPrefs]
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="density-gap-section">
                {/* Category settings from framework */}
                {!settingsLoading && settingsContent}

                <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3">Delivery Methods</h4>
                    <div className="space-y-2">
                        {[
                            { id: "email_enabled", label: "Email", icon: Mail },
                            {
                                id: "push_enabled",
                                label: "Push Notifications",
                                icon: Bell,
                            },
                            {
                                id: "sms_enabled",
                                label: "SMS",
                                icon: Smartphone,
                            },
                        ].map((method) => {
                            const enabled = notifPrefs
                                ? Boolean(
                                      (notifPrefs as Record<string, unknown>)[method.id] ??
                                      method.id === "email_enabled"
                                  )
                                : method.id === "email_enabled";
                            return (
                                <div
                                    key={method.id}
                                    className="flex items-center justify-between p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <method.icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{method.label}</span>
                                    </div>
                                    <button
                                        onClick={() => handleNotifToggle(method.id, !enabled)}
                                        className={`h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
                                        role="switch"
                                        aria-checked={enabled}
                                        aria-label={`Toggle ${method.label}`}
                                    >
                                        <div
                                            className={`h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Security Tab ────────────────────────────────────────────────

export function SecurityTab() {
    const { user } = useAuth();
    const router = useRouter();
    const { data: sessions } = useUserSessions(user?.id ?? null);
    const revokeSession = useRevokeSession();

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    <div className="space-y-2">
                        <label htmlFor="current-password" className="text-sm font-medium">
                            Current Password
                        </label>
                        <Input id="current-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="new-password" className="text-sm font-medium">
                            New Password
                        </label>
                        <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">
                            Confirm New Password
                        </label>
                        <Input id="confirm-password" type="password" placeholder="••••••••" />
                    </div>
                    <Button onClick={() => router.push("/settings/security")}>
                        <Key className="h-4 w-4" />
                        Update Password
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                        <div>
                            <p className="text-sm font-medium">2FA Status</p>
                            <p className="text-xs text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Badge variant="ghost">Not Enabled</Badge>
                    </div>
                    <Button
                        variant="ghost"
                        className="mt-3"
                        onClick={() => router.push("/auth/mfa-setup")}
                    >
                        <Shield className="h-4 w-4" />
                        Enable 2FA
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sessions && sessions.length > 0 ? (
                            sessions.map((session: Record<string, unknown>) => {
                                const s = session as Record<string, unknown>;
                                return (
                                    <div
                                        key={s.id as string}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Monitor className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {(s.device_name as string) ?? "Unknown device"}{" "}
                                                    — {(s.browser as string) ?? "Unknown browser"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(s.ip_address as string) ?? "—"} · Last active:{" "}
                                                    {s.last_active_at
                                                        ? new Date(
                                                              s.last_active_at as string
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    (s.is_active as boolean) ? "success" : "ghost"
                                                }
                                            >
                                                {(s.is_active as boolean) ? "Active" : "Ended"}
                                            </Badge>
                                            {(s.is_active as boolean) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        revokeSession.mutate(s.id as string)
                                                    }
                                                >
                                                    <LogOut className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Current Session</p>
                                        <p className="text-xs text-muted-foreground">Active now</p>
                                    </div>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
