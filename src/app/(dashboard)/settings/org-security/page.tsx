"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function OrgSecurityPage() {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id;

    const [settings, setSettings] = useState<OrgSecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [newDomain, setNewDomain] = useState("");

    // Fetch org security settings
    useEffect(() => {
        if (!orgId) {
            setLoading(false);
            return;
        }

        async function fetchSettings() {
            try {
                const res = await fetch(`/api/organizations/${orgId}/security`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data.organization);
                } else if (res.status === 403) {
                    setError("You do not have permission to view organization security settings.");
                } else {
                    setError("Failed to load security settings.");
                }
            } catch {
                setError("Failed to load security settings.");
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, [orgId]);

    const handleSave = useCallback(async () => {
        if (!settings || !orgId) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/organizations/${orgId}/security`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    require_mfa: settings.require_mfa,
                    enforce_sso: settings.enforce_sso,
                    sso_domain: settings.sso_domain,
                    allowed_email_domains: settings.allowed_email_domains,
                    session_timeout_hours: settings.session_timeout_hours,
                    max_sessions_per_user: settings.max_sessions_per_user,
                    invitation_expiry_days: settings.invitation_expiry_days,
                    default_role: settings.default_role,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(data.organization);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save settings.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [settings, orgId]);

    const updateField = useCallback(
        <K extends keyof OrgSecuritySettings>(field: K, value: OrgSecuritySettings[K]) => {
            setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
        },
        []
    );

    const addDomain = useCallback(() => {
        const domain = newDomain.trim().toLowerCase();
        if (!domain || !domain.includes(".")) return;
        if (!settings) return;

        if (!settings.allowed_email_domains.includes(domain)) {
            updateField("allowed_email_domains", [...settings.allowed_email_domains, domain]);
        }
        setNewDomain("");
    }, [newDomain, settings, updateField]);

    const removeDomain = useCallback(
        (domain: string) => {
            if (!settings) return;
            updateField(
                "allowed_email_domains",
                settings.allowed_email_domains.filter((d) => d !== domain)
            );
        },
        [settings, updateField]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!orgId || !activeOrg) {
        return (
            <div className="max-w-2xl space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">Organization Security</h1>
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    No organization found. Please set up your organization first.
                </div>
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="max-w-2xl space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">Organization Security</h1>
                <div
                    className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
                    role="alert"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                </div>
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="space-y-6 max-w-2xl animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organization Security</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Security policies for <strong>{settings.name}</strong>
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" aria-hidden="true" /> Save Changes
                        </>
                    )}
                </Button>
            </div>

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
                <CardContent className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="space-y-0.5">
                            <span className="text-sm font-medium">
                                Require Multi-Factor Authentication
                            </span>
                            <p className="text-xs text-muted-foreground">
                                All members must enable MFA to access the organization.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.require_mfa}
                            onClick={() => updateField("require_mfa", !settings.require_mfa)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                settings.require_mfa ? "bg-primary" : "bg-muted"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                    settings.require_mfa ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="space-y-0.5">
                            <span className="text-sm font-medium">Enforce SSO</span>
                            <p className="text-xs text-muted-foreground">
                                Require users to authenticate via SSO. Password login will be
                                disabled.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.enforce_sso}
                            onClick={() => updateField("enforce_sso", !settings.enforce_sso)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                settings.enforce_sso ? "bg-primary" : "bg-muted"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                    settings.enforce_sso ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </label>
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
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="sso-domain" className="text-sm font-medium">
                            SSO Domain
                        </label>
                        <Input
                            id="sso-domain"
                            type="text"
                            placeholder="company.com"
                            value={settings.sso_domain || ""}
                            onChange={(e) => updateField("sso_domain", e.target.value || null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Users with this email domain will be auto-assigned to this org on
                            signup.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">Allowed Email Domains</span>
                        <p className="text-xs text-muted-foreground">
                            Restrict invitations to these email domains. Leave empty to allow any
                            domain.
                        </p>
                        {settings.allowed_email_domains.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {settings.allowed_email_domains.map((domain) => (
                                    <span
                                        key={domain}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary"
                                    >
                                        {domain}
                                        <button
                                            type="button"
                                            onClick={() => removeDomain(domain)}
                                            className="hover:text-destructive transition-colors"
                                            aria-label={`Remove ${domain}`}
                                        >
                                            <X className="h-3 w-3" aria-hidden="true" />
                                        </button>
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
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="session-timeout" className="text-sm font-medium">
                                Session Timeout (hours)
                            </label>
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
                            <label htmlFor="max-sessions" className="text-sm font-medium">
                                Max Sessions Per User
                            </label>
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
                            <label htmlFor="invite-expiry" className="text-sm font-medium">
                                Invitation Expiry (days)
                            </label>
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
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="default-role" className="text-sm font-medium">
                            Default Role for New Members
                        </label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                aria-hidden="true"
                            />
                            <select
                                id="default-role"
                                value={settings.default_role}
                                onChange={(e) => updateField("default_role", e.target.value)}
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" aria-hidden="true" /> Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
