"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    useCredentialAssignments,
    useCredentialScanLogs,
} from "@/lib/supabase/hooks-credentialing";
import { BadgeCheck, LogIn, LogOut, ShieldAlert, Ticket, Users } from "lucide-react";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const BASE_CONFIG: DashboardPageConfig = {
    resource: "credential_assignments",
    action: "read" as const,
    title: "Live Credentials",
    description: "Real-time credential status and scan activity",
    emptyState: {
        icon: Ticket,
        title: "No credentials",
        description: "Active credential assignments will appear here during live events.",
    },
};

export function LiveOpsCredentialsPageClient() {
    const { data: assignments, isLoading: loadingAssignments } = useCredentialAssignments({
        status: ["approved", "issued", "checked_in", "checked_out"],
    });
    const { data: recentScans, isLoading: loadingScans } = useCredentialScanLogs();

    const isLoading = loadingAssignments || loadingScans;

    const rows = useMemo(() => (assignments ?? []) as Row[], [assignments]);
    const scans = useMemo(() => ((recentScans ?? []) as Row[]).slice(0, 20), [recentScans]);

    const checkedIn = rows.filter((r) => r.status === "checked_in").length;
    const checkedOut = rows.filter((r) => r.status === "checked_out").length;
    const deniedScans = scans.filter((s) =>
        ["denied", "revoked", "zone_denied", "expired"].includes(s.scan_result as string)
    ).length;

    const config = useMemo<DashboardPageConfig>(
        () => ({
            ...BASE_CONFIG,
            stats: [
                { label: "Active Credentials", icon: Ticket, value: rows.length },
                { label: "Checked In", icon: LogIn, value: checkedIn },
                { label: "Checked Out", icon: LogOut, value: checkedOut },
                { label: "Denied Scans", icon: ShieldAlert, value: deniedScans },
            ],
        }),
        [rows.length, checkedIn, checkedOut, deniedScans]
    );

    return (
        <OperationalDashboardShell config={config} data={rows} isLoading={isLoading}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <BadgeCheck className="h-4 w-4" />
                            Currently Checked In ({checkedIn})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {checkedIn === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No active check-ins
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {rows
                                    .filter((r) => r.status === "checked_in")
                                    .map((r) => (
                                        <div
                                            key={r.id as string}
                                            className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {r.assignee_name as string}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    {r.barcode_value as string}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="success" className="text-[9px]">
                                                    IN
                                                </Badge>
                                                {typeof r.checked_in_at === "string" && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(
                                                            r.checked_in_at
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            Recent Scans
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {scans.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No recent scan activity
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {scans.map((s) => {
                                    const result = s.scan_result as string;
                                    const isValid = result === "valid";
                                    return (
                                        <div
                                            key={s.id as string}
                                            className={`flex items-center justify-between p-2 rounded-lg border ${
                                                isValid
                                                    ? "bg-card border-border"
                                                    : "bg-destructive/5 border-destructive/20"
                                            }`}
                                        >
                                            <div>
                                                <Badge
                                                    variant={isValid ? "success" : "destructive"}
                                                    className="text-[9px]"
                                                >
                                                    {result.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {(s.scan_type as string).replace("_", " ")}
                                                </p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(
                                                    s.scanned_at as string
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </OperationalDashboardShell>
    );
}
