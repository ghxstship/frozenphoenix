"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusLabel } from "@/config/ui-variants";
import { MOCK_LOGIN_AUDIT, MOCK_ROLE_CHANGES } from "@/lib/mock-data-user-lifecycle";
import {
    KeyRound, Search, ShieldCheck, ShieldAlert, LogIn, LogOut, AlertTriangle,
    Clock, Globe, Monitor, Smartphone, Download,
} from "lucide-react";
import type { LoginEventType, RoleChangeType } from "@/types";

type AuditTab = "login" | "role_changes";

const EVENT_ICONS: Partial<Record<LoginEventType, typeof LogIn>> = {
    login_success: LogIn,
    login_failure: ShieldAlert,
    logout: LogOut,
    token_refresh: Clock,
    password_reset_request: KeyRound,
    password_reset_complete: ShieldCheck,
    session_revoked: AlertTriangle,
    account_locked: ShieldAlert,
};

const EVENT_LABELS: Partial<Record<LoginEventType, string>> = {
    login_success: "Login Success",
    login_failure: "Login Failed",
    logout: "Logout",
    token_refresh: "Token Refresh",
    password_reset_request: "Password Reset Request",
    password_reset_complete: "Password Reset Complete",
    mfa_challenge: "MFA Challenge",
    mfa_success: "MFA Success",
    mfa_failure: "MFA Failure",
    api_token_auth: "API Token Auth",
    session_revoked: "Session Revoked",
    account_locked: "Account Locked",
};

const CHANGE_TYPE_LABELS: Partial<Record<RoleChangeType, string>> = {
    role_granted: "Role Granted",
    role_changed: "Role Changed",
    role_revoked: "Role Revoked",
    membership_created: "Membership Created",
    membership_suspended: "Membership Suspended",
    membership_expired: "Membership Expired",
    membership_revoked: "Membership Revoked",
    project_access_granted: "Project Access Granted",
    project_access_revoked: "Project Access Revoked",
    temp_grant_created: "Temp Grant Created",
    temp_grant_revoked: "Temp Grant Revoked",
    account_suspended: "Account Suspended",
    account_deactivated: "Account Deactivated",
    account_reactivated: "Account Reactivated",
    account_deletion_requested: "Deletion Requested",
    account_anonymized: "Account Anonymized",
};

function getDeviceIcon(userAgent?: string) {
    if (!userAgent) return Monitor;
    if (userAgent.toLowerCase().includes("iphone") || userAgent.toLowerCase().includes("android")) return Smartphone;
    return Monitor;
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AuditLogPage() {
    const [activeTab, setActiveTab] = useState<AuditTab>("login");
    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState<"all" | "success" | "failure">("all");

    const filteredLogins = useMemo(() => {
        return MOCK_LOGIN_AUDIT.filter((e) => {
            const matchesSearch =
                !search ||
                (e.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (e.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (e.ipAddress ?? "").includes(search);
            const matchesEvent =
                eventFilter === "all" ||
                (eventFilter === "success" && e.success) ||
                (eventFilter === "failure" && !e.success);
            return matchesSearch && matchesEvent;
        });
    }, [search, eventFilter]);

    const filteredRoleChanges = useMemo(() => {
        return MOCK_ROLE_CHANGES.filter((r) => {
            return (
                !search ||
                (r.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (r.changedByName ?? "").toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search]);

    const successCount = MOCK_LOGIN_AUDIT.filter((e) => e.success).length;
    const failureCount = MOCK_LOGIN_AUDIT.filter((e) => !e.success).length;
    const uniqueIps = new Set(MOCK_LOGIN_AUDIT.map((e) => e.ipAddress).filter(Boolean)).size;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Audit Log" description="Immutable log of authentication events, role changes, and access modifications">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Login Events" value={MOCK_LOGIN_AUDIT.length} icon={LogIn} />
                <StatCard title="Successful" value={successCount} icon={ShieldCheck} />
                <StatCard title="Failed" value={failureCount} icon={ShieldAlert} />
                <StatCard title="Unique IPs" value={uniqueIps} icon={Globe} />
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2">
                <Button
                    variant={activeTab === "login" ? "default" : "outline"}
                    onClick={() => setActiveTab("login")}
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login Events
                </Button>
                <Button
                    variant={activeTab === "role_changes" ? "default" : "outline"}
                    onClick={() => setActiveTab("role_changes")}
                >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Role Changes
                </Button>
            </div>

            {activeTab === "login" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            Authentication Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by email, user, or IP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(["all", "success", "failure"] as const).map((f) => (
                                    <Button
                                        key={f}
                                        variant={eventFilter === f ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setEventFilter(f)}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {filteredLogins.map((event) => {
                                const Icon = EVENT_ICONS[event.eventType] ?? LogIn;
                                const DeviceIcon = getDeviceIcon(event.userAgent);
                                const label = EVENT_LABELS[event.eventType] ?? event.eventType;

                                return (
                                    <div
                                        key={event.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                            event.success ? "bg-secondary/30 hover:bg-secondary/50" : "bg-destructive/5 hover:bg-destructive/10"
                                        }`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                            event.success ? "bg-success/10" : "bg-destructive/10"
                                        }`}>
                                            <Icon className={`h-4 w-4 ${event.success ? "text-success" : "text-destructive"}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {event.userName ?? event.email ?? "Unknown"}
                                                </span>
                                                <Badge variant={event.success ? "success" : "destructive"} className="text-[10px]">
                                                    {label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                                                {event.authMethod && (
                                                    <span>{getStatusLabel(event.authMethod)}</span>
                                                )}
                                                {event.ipAddress && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="h-2.5 w-2.5" />
                                                        {event.ipAddress}
                                                    </span>
                                                )}
                                                {event.city && event.countryCode && (
                                                    <span>{event.city}, {event.countryCode}</span>
                                                )}
                                                {event.failureReason && (
                                                    <span className="text-destructive">{event.failureReason}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                                            <DeviceIcon className="h-3.5 w-3.5" />
                                            <span>{formatTime(event.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "role_changes" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <KeyRound className="h-4 w-4" />
                            Role & Access Changes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by user or changed by..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="space-y-2">
                            {filteredRoleChanges.map((change) => {
                                const label = CHANGE_TYPE_LABELS[change.changeType] ?? change.changeType;
                                const isNegative = ["account_suspended", "account_deactivated", "account_deletion_requested", "account_anonymized", "membership_suspended", "membership_revoked", "role_revoked"].includes(change.changeType);

                                return (
                                    <div key={change.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                            isNegative ? "bg-destructive/10" : "bg-info/10"
                                        }`}>
                                            <KeyRound className={`h-4 w-4 ${isNegative ? "text-destructive" : "text-info"}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium">{change.userName}</span>
                                                <Badge variant={isNegative ? "destructive" : "info"} className="text-[10px]">
                                                    {label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                                {change.oldValue && change.newValue && (
                                                    <span>
                                                        {getStatusLabel(change.oldValue)} → {getStatusLabel(change.newValue)}
                                                    </span>
                                                )}
                                                {!change.oldValue && change.newValue && (
                                                    <span>→ {getStatusLabel(change.newValue)}</span>
                                                )}
                                                {change.reason && (
                                                    <span className="italic">&ldquo;{change.reason}&rdquo;</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-muted-foreground">by {change.changedByName}</p>
                                            <p className="text-[10px] text-muted-foreground">{formatTime(change.createdAt)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
