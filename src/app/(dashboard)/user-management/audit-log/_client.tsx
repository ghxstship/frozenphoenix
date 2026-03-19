"use client";

import { formatDateTime } from "@/lib/locale";

import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { getStatusLabel } from "@/config/ui-variants";
import type { LoginAuditEntry, RoleChangeLogEntry } from "@/types/user-lifecycle";
import { useLoginAuditLog, useRoleChangeLog } from "@/lib/supabase";
import {
    AlertTriangle,
    Clock,
    Download,
    Globe,
    KeyRound,
    LogIn,
    LogOut,
    Monitor,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
} from "lucide-react";
import type { LoginEventType, RoleChangeType } from "@/types";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

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
    if (userAgent.toLowerCase().includes("iphone") || userAgent.toLowerCase().includes("android"))
        return Smartphone;
    return Monitor;
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return formatDateTime(d);
}

export function AuditLogPageClient() {
    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState<"all" | "success" | "failure">("all");

    const { data: sbLoginAudit } = useLoginAuditLog();
    const loginAudit = useMemo<LoginAuditEntry[]>(
        () => (sbLoginAudit ?? []) as unknown as LoginAuditEntry[],
        [sbLoginAudit]
    );
    const { data: sbRoleChanges } = useRoleChangeLog();
    const roleChanges = useMemo<RoleChangeLogEntry[]>(
        () => (sbRoleChanges ?? []) as unknown as RoleChangeLogEntry[],
        [sbRoleChanges]
    );

    const filteredLogins = useMemo(() => {
        return loginAudit.filter((e) => {
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
    }, [loginAudit, search, eventFilter]);

    const filteredRoleChanges = useMemo(() => {
        return roleChanges.filter((r) => {
            return (
                !search ||
                (r.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (r.changedByName ?? "").toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [roleChanges, search]);

    const successCount = loginAudit.filter((e) => e.success).length;
    const failureCount = loginAudit.filter((e) => !e.success).length;
    const uniqueIps = new Set(loginAudit.map((e) => e.ipAddress).filter(Boolean)).size;

    const handleExportLogins = useCallback(() => {
        const headers = ["Time", "User", "Email", "Event", "Success", "IP", "User Agent"];
        const rows = filteredLogins.map((e) =>
            [
                e.createdAt,
                e.userName,
                e.email,
                e.eventType,
                e.success,
                e.ipAddress,
                e.userAgent ?? "",
            ].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `login-audit-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredLogins]);

    const handleExportRoleChanges = useCallback(() => {
        const headers = [
            "Time",
            "User",
            "Change Type",
            "Old Role",
            "New Role",
            "Changed By",
            "Reason",
        ];
        const rows = filteredRoleChanges.map((r) =>
            [
                r.createdAt,
                r.userName,
                r.changeType,
                r.oldValue ?? "",
                r.newValue ?? "",
                r.changedByName ?? "",
                r.reason ?? "",
            ].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `role-changes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredRoleChanges]);

    const loginContent = (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Authentication Events
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExportLogins}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search by email, user, or IP..."
                        className="flex-1"
                    />
                    <div className="flex gap-2">
                        {(["all", "success", "failure"] as const).map((f) => (
                            <Button
                                key={f}
                                variant={eventFilter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setEventFilter(f)}
                            >
                                {f === "all" ? "All" : f === "success" ? "Success" : "Failure"}
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
                                    event.success
                                        ? "bg-secondary/30 hover:bg-secondary/50"
                                        : "bg-destructive/5 hover:bg-destructive/10"
                                }`}
                            >
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                        event.success ? "bg-success/10" : "bg-destructive/10"
                                    }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 ${event.success ? "text-success" : "text-destructive"}`}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {event.userName ?? event.email ?? "Unknown"}
                                        </span>
                                        <Badge
                                            variant={event.success ? "success" : "destructive"}
                                            className="text-[10px]"
                                        >
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
                                            <span>
                                                {event.city}, {event.countryCode}
                                            </span>
                                        )}
                                        {event.failureReason && (
                                            <span className="text-destructive">
                                                {event.failureReason}
                                            </span>
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
    );

    const roleChangesContent = (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Role & Access Changes
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExportRoleChanges}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search by user or changed by..."
                    className="mb-4"
                />

                <div className="space-y-2">
                    {filteredRoleChanges.map((change) => {
                        const label = CHANGE_TYPE_LABELS[change.changeType] ?? change.changeType;
                        const isNegative = [
                            "account_suspended",
                            "account_deactivated",
                            "account_deletion_requested",
                            "account_anonymized",
                            "membership_suspended",
                            "membership_revoked",
                            "role_revoked",
                        ].includes(change.changeType);

                        return (
                            <div
                                key={change.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                            >
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                        isNegative ? "bg-destructive/10" : "bg-info/10"
                                    }`}
                                >
                                    <KeyRound
                                        className={`h-4 w-4 ${isNegative ? "text-destructive" : "text-info"}`}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium">
                                            {change.userName}
                                        </span>
                                        <Badge
                                            variant={isNegative ? "destructive" : "info"}
                                            className="text-[10px]"
                                        >
                                            {label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                        {change.oldValue && change.newValue && (
                                            <span>
                                                {getStatusLabel(change.oldValue)} →{" "}
                                                {getStatusLabel(change.newValue)}
                                            </span>
                                        )}
                                        {!change.oldValue && change.newValue && (
                                            <span>→ {getStatusLabel(change.newValue)}</span>
                                        )}
                                        {change.reason && (
                                            <span className="italic">
                                                &ldquo;{change.reason}&rdquo;
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-xs text-muted-foreground">
                                        by {change.changedByName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatTime(change.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );

    const config: DashboardPageConfig = {
        resource: "audit_log",
        title: "Audit Log",
        description:
            "Immutable log of authentication events, role changes, and access modifications",
        searchable: false,
        stats: [
            { label: "Login Events", value: loginAudit.length, icon: LogIn },
            { label: "Successful", value: successCount, icon: ShieldCheck },
            { label: "Failed", value: failureCount, icon: ShieldAlert },
            { label: "Unique IPs", value: uniqueIps, icon: Globe },
        ],
        tabs: [
            { id: "login", label: "Login Events", icon: LogIn, content: loginContent },
            {
                id: "role_changes",
                label: "Role Changes",
                icon: KeyRound,
                content: roleChangesContent,
            },
        ],
    };

    return <OperationalDashboardShell config={config} />;
}
