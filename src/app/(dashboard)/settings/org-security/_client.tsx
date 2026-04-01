"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useOrgSecuritySettings, useUpdateOrgSecuritySettings } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Globe,
    Loader2,
    Lock,
    Mail,
    Plus,
    Save,
    Users,
    X,
} from "lucide-react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

interface OrgSecuritySettings {
    id: string;
    name: string;
    slug: string;
    require_mfa: boolean;
    enforce_sso: boolean;
    sso_domain: string | null;
    allowed_email_domains: string[];
    session_timeout_hours: number;
    max_sessions_per_user: number;
    invitation_expiry_days: number;
    default_role: string;
}

const ROLE_OPTIONS = [
    { value: "exec", label: "Executive" },
    { value: "pm", label: "Project Manager" },
    { value: "client", label: "Client" },
    { value: "vendor", label: "Vendor" },
];

export function OrgSecurityPageClient() {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id;

    const {
        data: fetchedSettings,
        isLoading: loading,
        error: fetchError,
    } = useOrgSecuritySettings(orgId) as {
        data: OrgSecuritySettings | undefined;
        isLoading: boolean;
        error: Error | null;
    };

    if (!orgId || !activeOrg) {
        return (
            <ListPageShell
                config={{
                    entityKey: "security",
                    resource: "security",
                    action: "read",
                    title: "Organization Security",
                    description: "",
                    contentSlot: (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            No organization found. Please set up your organization first.
                        </div>
                    ),
                }}
                data={[]}
                isLoading={loading}
            />
        );
    }

    if (fetchError && !fetchedSettings) {
        return (
            <ListPageShell
                config={{
                    entityKey: "security",
                    resource: "security",
                    action: "read",
                    title: "Organization Security",
                    description: "",
                    contentSlot: (
                        <div
                            className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
                            role="alert"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {fetchError.message}
                        </div>
                    ),
                }}
                data={[]}
                isLoading={false}
            />
        );
    }

    if (!fetchedSettings) return null;

    return <OrgSecurityForm initialSettings={fetchedSettings} orgId={orgId} />;
}

function OrgSecurityForm({
    initialSettings,
    orgId,
}: {
    initialSettings: OrgSecuritySettings;
    orgId: string;
}) {
    const updateMutation = useUpdateOrgSecuritySettings(orgId);

    const [settings, setSettings] = useState<OrgSecuritySettings>(initialSettings);
    const [success, setSuccess] = useState(false);
    const [newDomain, setNewDomain] = useState("");

    const saving = updateMutation.isPending;
    const error = updateMutation.error?.message ?? null;

    const handleSave = useCallback(() => {
        setSuccess(false);

        updateMutation.mutate(
            {
                require_mfa: settings.require_mfa,
                enforce_sso: settings.enforce_sso,
                sso_domain: settings.sso_domain,
                allowed_email_domains: settings.allowed_email_domains,
                session_timeout_hours: settings.session_timeout_hours,
                max_sessions_per_user: settings.max_sessions_per_user,
                invitation_expiry_days: settings.invitation_expiry_days,
                default_role: settings.default_role,
            },
            {
                onSuccess: (data) => {
                    setSettings(data as unknown as OrgSecuritySettings);
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                },
            }
        );
    }, [settings, updateMutation]);

    const updateField = useCallback(
        <K extends keyof OrgSecuritySettings>(field: K, value: OrgSecuritySettings[K]) => {
            setSettings((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const addDomain = useCallback(() => {
        const domain = newDomain.trim().toLowerCase();
        if (!domain || !domain.includes(".")) return;

        if (!settings.allowed_email_domains.includes(domain)) {
            updateField("allowed_email_domains", [...settings.allowed_email_domains, domain]);
        }
        setNewDomain("");
    }, [newDomain, settings, updateField]);

    const removeDomain = useCallback(
        (domain: string) => {
            updateField(
                "allowed_email_domains",
                settings.allowed_email_domains.filter((d) => d !== domain)
            );
        },
        [settings, updateField]
    );

    const config: ListPageConfig = useMemo(
        () => ({
            entityKey: "security",
            resource: "security",
            action: "read",
            title: "Organization Security",
            description: `Security policies for ${settings.name}`,
            headerActions: (
                <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                    {saving ? (
                        <>
                            <Loader2
                                className="h-4 w-4 motion-safe:animate-spin"
                                aria-hidden="true"
                            />{" "}
                            Saving…
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" aria-hidden="true" /> Save Changes
                        </>
                    )}
                </Button>
            ),
            contentSlot: (
                <div className="max-w-2xl density-gap-page">
                    {error && settings && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                            role="alert"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
                            role="status"
                            aria-live="polite"
                        >
                            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Security settings saved successfully.
                        </div>
                    )}

                    {/* Authentication Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Lock className="h-4 w-4" aria-hidden="true" />
                                Authentication Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <Label className="flex items-center justify-between cursor-pointer">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-medium">
                                        Require Multi-Factor Authentication
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        All members must enable MFA to access the organization.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    role="switch"
                                    aria-checked={settings.require_mfa}
                                    onClick={() =>
                                        updateField("require_mfa", !settings.require_mfa)
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full p-0 transition-colors ${
                                        settings.require_mfa ? "bg-primary" : "bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                            settings.require_mfa ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </Button>
                            </Label>

                            <Label className="flex items-center justify-between cursor-pointer">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-medium">Enforce SSO</span>
                                    <p className="text-xs text-muted-foreground">
                                        Require users to authenticate via SSO. Password login will
                                        be disabled.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    role="switch"
                                    aria-checked={settings.enforce_sso}
                                    onClick={() =>
                                        updateField("enforce_sso", !settings.enforce_sso)
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full p-0 transition-colors ${
                                        settings.enforce_sso ? "bg-primary" : "bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                            settings.enforce_sso ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </Button>
                            </Label>
                        </CardContent>
                    </Card>

                    {/* SSO & Domain Restrictions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Globe className="h-4 w-4" aria-hidden="true" />
                                SSO &amp; Domain Restrictions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <div className="space-y-2">
                                <Label htmlFor="sso-domain" className="text-sm font-medium">
                                    SSO Domain
                                </Label>
                                <Input
                                    id="sso-domain"
                                    type="text"
                                    placeholder="company.com"
                                    value={settings.sso_domain || ""}
                                    onChange={(e) =>
                                        updateField("sso_domain", e.target.value || null)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Users with this email domain will be auto-assigned to this org
                                    on signup.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm font-medium">Allowed Email Domains</span>
                                <p className="text-xs text-muted-foreground">
                                    Restrict invitations to these email domains. Leave empty to
                                    allow any domain.
                                </p>
                                {settings.allowed_email_domains.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {settings.allowed_email_domains.map((domain) => (
                                            <span
                                                key={domain}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary"
                                            >
                                                {domain}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:text-destructive"
                                                    onClick={() => removeDomain(domain)}
                                                    aria-label={`Remove ${domain}`}
                                                >
                                                    <X className="h-3 w-3" aria-hidden="true" />
                                                </Button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="example.com"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addDomain();
                                            }
                                        }}
                                        aria-label="Add email domain"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={addDomain}
                                        aria-label="Add domain"
                                    >
                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session & Invitation Policies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-4 w-4" aria-hidden="true" />
                                Session &amp; Invitation Policies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <div className="grid grid-cols-1 sm:grid-cols-2 density-gap-card">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="session-timeout"
                                        className="text-sm font-medium"
                                    >
                                        Session Timeout (hours)
                                    </Label>
                                    <Input
                                        id="session-timeout"
                                        type="number"
                                        min={1}
                                        max={8760}
                                        value={settings.session_timeout_hours}
                                        onChange={(e) =>
                                            updateField(
                                                "session_timeout_hours",
                                                parseInt(e.target.value) || 720
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Max idle session time before re-authentication.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max-sessions" className="text-sm font-medium">
                                        Max Sessions Per User
                                    </Label>
                                    <Input
                                        id="max-sessions"
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={settings.max_sessions_per_user}
                                        onChange={(e) =>
                                            updateField(
                                                "max_sessions_per_user",
                                                parseInt(e.target.value) || 5
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Concurrent active sessions allowed.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="invite-expiry" className="text-sm font-medium">
                                        Invitation Expiry (days)
                                    </Label>
                                    <Input
                                        id="invite-expiry"
                                        type="number"
                                        min={1}
                                        max={90}
                                        value={settings.invitation_expiry_days}
                                        onChange={(e) =>
                                            updateField(
                                                "invitation_expiry_days",
                                                parseInt(e.target.value) || 7
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Days before an invitation link expires.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Default Member Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                Default Member Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <div className="space-y-2">
                                <Label htmlFor="default-role" className="text-sm font-medium">
                                    Default Role for New Members
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <NativeSelect
                                        id="default-role"
                                        value={settings.default_role}
                                        onChange={(e) =>
                                            updateField("default_role", e.target.value)
                                        }
                                        className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {ROLE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Role assigned to users who join via SSO domain matching.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom save */}
                    <div className="flex justify-end pt-2 pb-8">
                        <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                            {saving ? (
                                <>
                                    <Loader2
                                        className="h-4 w-4 motion-safe:animate-spin"
                                        aria-hidden="true"
                                    />{" "}
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" aria-hidden="true" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ),
        }),
        [
            settings,
            saving,
            error,
            success,
            handleSave,
            updateField,
            newDomain,
            addDomain,
            removeDomain,
        ]
    );

    return <ListPageShell config={config} data={[]} isLoading={false} />;
}
