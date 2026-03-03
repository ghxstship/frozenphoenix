"use client";

import React, { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/supabase/auth-context";
import { useSettings } from "@/lib/settings/settings-provider";
import {
    useNotificationPreferences,
    useRevokeSession,
    useUpsertNotificationPreferences,
    useUserSessions,
} from "@/lib/settings/hooks";
import { SettingRow } from "@/components/settings/setting-row";
import { PermissionGate } from "@/components/permission-guard";
import { useTheme } from "@/components/theme-provider";
import type { ColorMode } from "@/components/theme-provider";
import type { ResolvedSetting, SettingCategory } from "@/types/settings";
import {
    AtSign,
    Bell,
    Building2,
    CheckCircle2,
    ExternalLink,
    Key,
    Loader2,
    LogOut,
    Mail,
    Monitor,
    Moon,
    Palette,
    Save,
    Shield,
    Smartphone,
    Sun,
    Upload,
    User,
    XCircle,
} from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";

const ROLE_LABELS: Record<string, string> = {
    exec: "Executive",
    pm: "Project Manager",
    client: "Client",
    vendor: "Vendor",
};

type SettingsTab = "profile" | "organization" | "notifications" | "security" | "appearance";

const SETTINGS_TAB_VALUES = [
    "profile",
    "organization",
    "notifications",
    "security",
    "appearance",
] as const;

const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "organization", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
];

function SettingsCategorySection({
    category,
    settings,
    onSave,
}: {
    category: SettingCategory;
    settings: Map<string, ResolvedSetting>;
    onSave: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
}) {
    const filtered = Array.from(settings.values()).filter(
        (s) => s.definition.category === category
    );
    if (filtered.length === 0) return null;

    return (
        <div className="space-y-1">
            {filtered
                .sort((a, b) => a.definition.display_order - b.definition.display_order)
                .map((setting) => (
                    <SettingRow key={setting.definition.key} setting={setting} onSave={onSave} />
                ))}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useQueryTabState<SettingsTab>({
        key: "tab",
        defaultValue: "profile",
        validValues: SETTINGS_TAB_VALUES,
    });
    const { colorMode, setColorMode } = useTheme();
    const { user, profile, memberships, activeOrg } = useAuth();
    const { settings, loading: settingsLoading, updateSetting } = useSettings();

    // Profile form state — pre-populated from auth context
    const [profileName, setProfileName] = useState(profile?.name ?? "");
    const [profileEmail] = useState(user?.email ?? "");
    const [profileSaving, setProfileSaving] = useState(false);

    // Notification preferences
    const { data: notifPrefs } = useNotificationPreferences(user?.id ?? null);
    const upsertNotifPrefs = useUpsertNotificationPreferences();

    // Sessions
    const { data: sessions } = useUserSessions(user?.id ?? null);
    const revokeSession = useRevokeSession();

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

    const handleSaveSetting = useCallback(
        async (category: SettingCategory, key: string, value: unknown) => {
            await updateSetting(category, key, value);
        },
        [updateSetting]
    );

    const handleSaveProfile = useCallback(async () => {
        if (!user?.id) return;
        setProfileSaving(true);
        try {
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            if (sb) {
                await sb.from("profiles").update({ name: profileName }).eq("id", user.id);
            }
        } finally {
            setProfileSaving(false);
        }
    }, [user?.id, profileName]);

    const userRole = activeOrg?.role ?? profile?.role ?? "vendor";
    const userInitials = (profile?.name ?? "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Settings"
                description="Manage your account, organization, and preferences"
            />

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="lg:w-64 shrink-0">
                    <CardContent className="p-2">
                        <TabBar
                            idPrefix="settings-tabs"
                            ariaLabel="Settings navigation"
                            orientation="vertical"
                            variant="pill"
                            items={tabs}
                            value={activeTab}
                            onValueChange={(tabId) => setActiveTab(tabId as SettingsTab)}
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                <div className="flex-1 space-y-6">
                    <div
                        role="tabpanel"
                        id={`settings-tabs-tabpanel-${activeTab}`}
                        aria-labelledby={`settings-tabs-tab-${activeTab}`}
                    >
                        {/* ─── Profile Tab ─── */}
                        {activeTab === "profile" && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                                {userInitials}
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="sm">
                                                    <Upload className="h-4 w-4" />
                                                    Upload Photo
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    JPG, PNG up to 2MB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Full Name
                                                </label>
                                                <Input
                                                    id="profile-name"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-email"
                                                    className="text-sm font-medium"
                                                >
                                                    Email
                                                </label>
                                                <Input
                                                    id="profile-email"
                                                    value={profileEmail}
                                                    type="email"
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-role"
                                                    className="text-sm font-medium"
                                                >
                                                    Role
                                                </label>
                                                <Input
                                                    id="profile-role"
                                                    value={ROLE_LABELS[userRole] ?? userRole}
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-org"
                                                    className="text-sm font-medium"
                                                >
                                                    Organization
                                                </label>
                                                <Input
                                                    id="profile-org"
                                                    value={activeOrg?.organizations?.name ?? "—"}
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={profileSaving}
                                            >
                                                {profileSaving ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <UsernameCard />

                                {/* User Preferences from settings framework */}
                                {!settingsLoading && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Preferences</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SettingsCategorySection
                                                category="preferences"
                                                settings={settings}
                                                onSave={handleSaveSetting}
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}

                        {/* ─── Organization Tab ─── */}
                        {activeTab === "organization" && (
                            <PermissionGate resource="settings" action="read">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organization Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="org-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Organization Name
                                                </label>
                                                <Input
                                                    id="org-name"
                                                    value={activeOrg?.organizations?.name ?? "—"}
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="org-role"
                                                    className="text-sm font-medium"
                                                >
                                                    Your Role
                                                </label>
                                                <Input
                                                    id="org-role"
                                                    value={ROLE_LABELS[userRole] ?? userRole}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Team Members</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {memberships.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                            {m.user_id === user?.id
                                                                ? userInitials
                                                                : "??"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {m.user_id === user?.id
                                                                    ? (profile?.name ?? "You")
                                                                    : m.user_id.slice(0, 8)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {m.organizations?.name ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            m.role === "exec"
                                                                ? "default"
                                                                : m.role === "pm"
                                                                  ? "info"
                                                                  : "warning"
                                                        }
                                                    >
                                                        {ROLE_LABELS[m.role] ?? m.role}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                        <PermissionGate
                                            resource="invitations"
                                            action="write"
                                            silent
                                        >
                                            <Button variant="ghost" className="w-full mt-3">
                                                <User className="h-4 w-4" />
                                                Invite Team Member
                                            </Button>
                                        </PermissionGate>
                                    </CardContent>
                                </Card>

                                {/* Org-scoped settings */}
                                {!settingsLoading && (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Governance & Compliance</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="governance"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Security Controls</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="security"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Operational Controls</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="operational"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </PermissionGate>
                        )}

                        {/* ─── Notifications Tab ─── */}
                        {activeTab === "notifications" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Category settings from framework */}
                                    {!settingsLoading && (
                                        <SettingsCategorySection
                                            category="notifications"
                                            settings={settings}
                                            onSave={handleSaveSetting}
                                        />
                                    )}

                                    <div className="pt-4 border-t border-border">
                                        <h4 className="text-sm font-semibold mb-3">
                                            Delivery Methods
                                        </h4>
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
                                                          (notifPrefs as Record<string, unknown>)[
                                                              method.id
                                                          ] ?? method.id === "email_enabled"
                                                      )
                                                    : method.id === "email_enabled";
                                                return (
                                                    <div
                                                        key={method.id}
                                                        className="flex items-center justify-between p-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <method.icon className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {method.label}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleNotifToggle(
                                                                    method.id,
                                                                    !enabled
                                                                )
                                                            }
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
                        )}

                        {/* ─── Security Tab ─── */}
                        {activeTab === "security" && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="current-password"
                                                className="text-sm font-medium"
                                            >
                                                Current Password
                                            </label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="new-password"
                                                className="text-sm font-medium"
                                            >
                                                New Password
                                            </label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="confirm-password"
                                                className="text-sm font-medium"
                                            >
                                                Confirm New Password
                                            </label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <Button>
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
                                        <Button variant="ghost" className="mt-3">
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
                                                                        {(s.device_name as string) ??
                                                                            "Unknown device"}{" "}
                                                                        —{" "}
                                                                        {(s.browser as string) ??
                                                                            "Unknown browser"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {(s.ip_address as string) ??
                                                                            "—"}{" "}
                                                                        · Last active:{" "}
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
                                                                        (s.is_active as boolean)
                                                                            ? "success"
                                                                            : "ghost"
                                                                    }
                                                                >
                                                                    {(s.is_active as boolean)
                                                                        ? "Active"
                                                                        : "Ended"}
                                                                </Badge>
                                                                {(s.is_active as boolean) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            revokeSession.mutate(
                                                                                s.id as string
                                                                            )
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
                                                            <p className="text-sm font-medium">
                                                                Current Session
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Active now
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="success">Active</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* ─── Appearance Tab ─── */}
                        {activeTab === "appearance" && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme Preferences</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium mb-3">Color Mode</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {[
                                                    {
                                                        id: "light" as ColorMode,
                                                        label: "Light",
                                                        icon: Sun,
                                                    },
                                                    {
                                                        id: "dark" as ColorMode,
                                                        label: "Dark",
                                                        icon: Moon,
                                                    },
                                                    {
                                                        id: "system" as ColorMode,
                                                        label: "System",
                                                        icon: Monitor,
                                                    },
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => {
                                                            setColorMode(mode.id);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "theme",
                                                                mode.id
                                                            );
                                                        }}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                                                            colorMode === mode.id
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        }`}
                                                    >
                                                        <mode.icon
                                                            className={`h-6 w-6 ${colorMode === mode.id ? "text-primary" : "text-muted-foreground"}`}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {mode.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Accent Color</p>
                                            <div className="flex gap-2">
                                                {[
                                                    { hsl: "220 70% 50%", name: "Blue" },
                                                    { hsl: "262 83% 58%", name: "Violet" },
                                                    { hsl: "347 77% 50%", name: "Rose" },
                                                    { hsl: "31 97% 50%", name: "Orange" },
                                                    { hsl: "152 69% 40%", name: "Emerald" },
                                                ].map((accent) => (
                                                    <button
                                                        key={accent.name}
                                                        className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-primary transition-all"
                                                        style={{
                                                            backgroundColor: `hsl(${accent.hsl})`,
                                                        }}
                                                        title={accent.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Density</p>
                                            <div className="flex gap-2">
                                                {["compact", "default", "comfortable"].map(
                                                    (density) => (
                                                        <button
                                                            key={density}
                                                            onClick={() =>
                                                                handleSaveSetting(
                                                                    "preferences",
                                                                    "layout_density",
                                                                    density
                                                                )
                                                            }
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                density === "default"
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-secondary hover:bg-secondary/80"
                                                            }`}
                                                        >
                                                            {
                                                                {
                                                                    compact: "Compact",
                                                                    default: "Default",
                                                                    comfortable: "Comfortable",
                                                                }[density]
                                                            }
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Branding settings (exec only) */}
                                {!settingsLoading && (
                                    <PermissionGate resource="brand" action="write" silent>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Branding</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="branding"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                    </PermissionGate>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Username Management Card (used in Profile tab) ─────────────────
type UsernameAvailability = "idle" | "checking" | "available" | "unavailable";

function UsernameCard() {
    const { username, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState("");
    const [availability, setAvailability] = useState<UsernameAvailability>("idle");
    const [reason, setReason] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = useCallback((value: string) => {
        const normalized = value.toLowerCase().trim();
        setInput(normalized);
        if (normalized.length < 3) {
            setAvailability("idle");
            setReason(null);
            setSuggestions([]);
        }
    }, []);

    // Debounced availability check
    useEffect(() => {
        if (!editing || input.length < 3) return;

        const timer = setTimeout(async () => {
            setAvailability("checking");
            try {
                const res = await fetch(`/api/usernames/check?q=${encodeURIComponent(input)}`);
                if (!res.ok) {
                    setAvailability("idle");
                    return;
                }
                const data = await res.json();
                setAvailability(data.available ? "available" : "unavailable");
                setReason(data.reason ?? null);
                setSuggestions(data.suggestions ?? []);
            } catch {
                setAvailability("idle");
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [input, editing]);

    const handleSave = useCallback(async () => {
        if (availability !== "available" || !input) return;
        setSaving(true);
        setError(null);

        const endpoint = username ? "/api/usernames/change" : "/api/usernames/claim";
        const method = username ? "PATCH" : "POST";

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: input }),
            });

            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                setError("Unexpected response. Please try again.");
                setSaving(false);
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                const msg =
                    typeof data.error === "string"
                        ? data.error
                        : (data.error?.message ?? "Failed to update username.");
                setError(msg);
                setSaving(false);
                return;
            }

            try {
                await refreshProfile();
            } catch {
                // best-effort
            }

            setSaving(false);
            setEditing(false);
            setInput("");
            setAvailability("idle");
        } catch {
            setError("Something went wrong. Please try again.");
            setSaving(false);
        }
    }, [input, availability, username, refreshProfile]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Username
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!editing ? (
                    <div className="flex items-center justify-between">
                        <div>
                            {username ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">@{username}</span>
                                    <a
                                        href={`/u/${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        View profile
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No username set. Claim one to get a public profile.
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setEditing(true);
                                setInput(username ?? "");
                                setError(null);
                            }}
                        >
                            {username ? "Change" : "Claim Username"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="settings-username" className="text-sm font-medium">
                                {username ? "New Username" : "Choose a Username"}
                            </label>
                            <div className="relative">
                                <AtSign
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                    aria-hidden="true"
                                />
                                <Input
                                    id="settings-username"
                                    value={input}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="your.username"
                                    className="pl-10 pr-10"
                                    disabled={saving}
                                    autoComplete="off"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {availability === "checking" && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {availability === "available" && (
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                    )}
                                    {availability === "unavailable" && (
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                </div>
                            </div>
                            {availability === "available" && (
                                <p className="text-xs text-success">Username is available!</p>
                            )}
                            {availability === "unavailable" && reason && (
                                <p className="text-xs text-destructive">{reason}</p>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleInputChange(s)}
                                        className="px-2 py-1 text-xs rounded-md border border-border hover:bg-accent/10 transition-colors"
                                    >
                                        @{s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditing(false);
                                    setInput("");
                                    setError(null);
                                    setAvailability("idle");
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || availability !== "available"}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {username ? "Change Username" : "Claim Username"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
