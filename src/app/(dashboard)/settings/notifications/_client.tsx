"use client";

import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsPageShell } from "@/components/shells/settings-page-shell";
import type { SettingsPageConfig } from "@/types/settings-page-config";
import { useAuth } from "@/lib/supabase/auth-context";
import {
    useNotificationPreferences,
    useUpsertNotificationPreferences,
} from "@/lib/supabase/hooks-workflows";
import { useToast } from "@/components/ui/toast";
import { Bell, Clock, Mail, MessageSquare, Moon, Smartphone, Zap } from "lucide-react";
import { LoadingState } from "@/components/layouts/loading-state";

// ─── Toggle Switch ───────────────────────────────────────────

function ToggleSwitch({
    enabled,
    onToggle,
    label,
}: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
}) {
    return (
        <button
            onClick={onToggle}
            className={`h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
            role="switch"
            aria-checked={enabled}
            aria-label={`Toggle ${label}`}
        >
            <div
                className={`h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
            />
        </button>
    );
}

// ─── Channel Row ─────────────────────────────────────────────

function ChannelRow({
    icon: Icon,
    label,
    description,
    enabled,
    onToggle,
}: {
    icon: React.ElementType;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} onToggle={onToggle} label={label} />
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────

export function NotificationSettingsPageClient() {
    const { user } = useAuth();
    const { data: prefs, isLoading } = useNotificationPreferences(user?.id ?? "");
    const upsert = useUpsertNotificationPreferences();
    const { addToast } = useToast();

    const handleToggle = useCallback(
        (channel: string, currentValue: boolean) => {
            if (!user?.id) return;
            upsert.mutate(
                { user_id: user.id, [channel]: !currentValue },
                {
                    onSuccess: () => addToast({ title: "Preference updated", variant: "success" }),
                    onError: () =>
                        addToast({ title: "Failed to update preference", variant: "destructive" }),
                }
            );
        },
        [user?.id, upsert, addToast]
    );

    const handleQuietHoursField = useCallback(
        (field: string, value: string) => {
            if (!user?.id) return;
            upsert.mutate({ user_id: user.id, [field]: value });
        },
        [user?.id, upsert]
    );

    const getBool = (key: string, fallback = false): boolean => {
        if (!prefs) return fallback;
        return Boolean((prefs as Record<string, unknown>)[key] ?? fallback);
    };

    const getString = (key: string, fallback = ""): string => {
        if (!prefs) return fallback;
        return String((prefs as Record<string, unknown>)[key] ?? fallback);
    };

    if (isLoading) return <LoadingState />;

    const preferencesContent = (
        <div className="density-gap-page max-w-3xl">
            {/* ─── Delivery Channels ─── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4" />
                        Delivery Channels
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <ChannelRow
                        icon={Mail}
                        label="Email notifications"
                        description="Receive notifications via email"
                        enabled={getBool("email_enabled", true)}
                        onToggle={() =>
                            handleToggle("email_enabled", getBool("email_enabled", true))
                        }
                    />
                    <ChannelRow
                        icon={Bell}
                        label="Push notifications"
                        description="Browser push notifications"
                        enabled={getBool("push_enabled", true)}
                        onToggle={() => handleToggle("push_enabled", getBool("push_enabled", true))}
                    />
                    <ChannelRow
                        icon={Smartphone}
                        label="SMS notifications"
                        description="Text message alerts for critical items"
                        enabled={getBool("sms_enabled")}
                        onToggle={() => handleToggle("sms_enabled", getBool("sms_enabled"))}
                    />
                    <ChannelRow
                        icon={MessageSquare}
                        label="In-app notifications"
                        description="Notification bell inside the application"
                        enabled={getBool("in_app_enabled", true)}
                        onToggle={() =>
                            handleToggle("in_app_enabled", getBool("in_app_enabled", true))
                        }
                    />
                </CardContent>
            </Card>

            {/* ─── Digests ─── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4" />
                        Digest Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <ChannelRow
                        icon={Clock}
                        label="Daily digest"
                        description="Receive a daily summary of activity"
                        enabled={getBool("daily_digest_enabled")}
                        onToggle={() =>
                            handleToggle("daily_digest_enabled", getBool("daily_digest_enabled"))
                        }
                    />
                    <ChannelRow
                        icon={Clock}
                        label="Weekly digest"
                        description="Receive a weekly summary every Monday"
                        enabled={getBool("weekly_digest_enabled")}
                        onToggle={() =>
                            handleToggle("weekly_digest_enabled", getBool("weekly_digest_enabled"))
                        }
                    />
                </CardContent>
            </Card>

            {/* ─── Quiet Hours ─── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Moon className="h-4 w-4" />
                        Quiet Hours
                    </CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    <ChannelRow
                        icon={Moon}
                        label="Enable quiet hours"
                        description="Suppress notifications during specified hours"
                        enabled={getBool("quiet_hours_enabled")}
                        onToggle={() =>
                            handleToggle("quiet_hours_enabled", getBool("quiet_hours_enabled"))
                        }
                    />
                    {getBool("quiet_hours_enabled") && (
                        <div className="grid grid-cols-1 density-gap-card pl-10 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Start</label>
                                <Input
                                    type="time"
                                    value={getString("quiet_hours_start", "22:00")}
                                    onBlur={(e) =>
                                        handleQuietHoursField("quiet_hours_start", e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">End</label>
                                <Input
                                    type="time"
                                    value={getString("quiet_hours_end", "08:00")}
                                    onBlur={(e) =>
                                        handleQuietHoursField("quiet_hours_end", e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Timezone</label>
                                <Input
                                    value={getString(
                                        "quiet_hours_timezone",
                                        Intl.DateTimeFormat().resolvedOptions().timeZone
                                    )}
                                    onBlur={(e) =>
                                        handleQuietHoursField(
                                            "quiet_hours_timezone",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const config: SettingsPageConfig = {
        resource: "settings",
        action: "read",
        title: "Notification Preferences",
        description: "Control how and when you receive notifications",
        tabs: [
            { id: "preferences", label: "Preferences", icon: Bell, content: preferencesContent },
        ],
    };

    return <SettingsPageShell config={config} />;
}
