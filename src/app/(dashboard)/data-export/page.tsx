"use client";

import React from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    FileJson,
    FileSpreadsheet,
    Inbox,
    Shield,
    User,
} from "lucide-react";
import type { DataExportStatus } from "@/types";
import { PermissionGate } from "@/components/permission-guard";
import { useCreateDataExportRequest, useDataExportRequests } from "@/lib/supabase";

const statusBadge = (status: DataExportStatus) => {
    const variants: Record<
        DataExportStatus,
        "success" | "warning" | "secondary" | "destructive" | "default"
    > = {
        requested: "secondary",
        processing: "warning",
        ready: "success",
        downloaded: "default",
        expired: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
};

function formatBytes(bytes: number | null): string | null {
    if (bytes == null || bytes === 0) return null;
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
        val /= 1024;
        i++;
    }
    return `${val.toFixed(1)} ${units[i]}`;
}

export default function DataExportPage() {
    const { data: sbExports, isLoading } = useDataExportRequests();
    const createExport = useCreateDataExportRequest();

    if (isLoading) {
        return <LoadingState />;
    }

    type ExportView = {
        id: string;
        format: string;
        status: DataExportStatus;
        requestedAt: string;
        completedAt: string | null;
        fileSize: string | null;
    };
    const exports: ExportView[] = (sbExports ?? []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        format: (e.export_format as string) ?? "json",
        status: (e.status as DataExportStatus) ?? "requested",
        requestedAt: (e.requested_at as string) ?? "",
        completedAt: (e.completed_at as string) ?? null,
        fileSize: formatBytes(e.file_size_bytes as number | null),
    }));

    const handleRequestExport = (format: "json" | "csv") => {
        createExport.mutate({ export_format: format });
    };

    return (
        <PermissionGate resource="data_export" action="read">
            <div className="space-y-6" id="main-content">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Export</h1>
                    <p className="text-muted-foreground">
                        Export your personal data (GDPR/CCPA compliant self-service)
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Exports"
                        value={exports.length}
                        icon={Download}
                        description="All time"
                    />
                    <StatCard
                        title="Available"
                        value={exports.filter((e) => e.status === "ready").length}
                        icon={CheckCircle2}
                        description="Ready to download"
                    />
                    <StatCard
                        title="Retention"
                        value="7 days"
                        icon={Clock}
                        description="Auto-expiry"
                    />
                    <StatCard title="Privacy" value="GDPR" icon={Shield} description="Compliant" />
                </div>

                {/* Request New Export */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4" />
                            Request Data Export
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Export all your personal data including profile, activity history, and
                            preferences. Exports are available for 7 days after generation.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleRequestExport("json")}
                                disabled={createExport.isPending}
                                className="flex items-center gap-2"
                            >
                                <FileJson className="h-4 w-4" />
                                {createExport.isPending ? "Requesting..." : "Export as JSON"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRequestExport("csv")}
                                disabled={createExport.isPending}
                                className="flex items-center gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {createExport.isPending ? "Requesting..." : "Export as CSV"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Export History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            Export History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {exports.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <Inbox className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">No export requests yet</p>
                                </div>
                            )}
                            {exports.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        {exp.format === "json" ? (
                                            <FileJson className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">
                                                Personal Data Export (
                                                {exp.format === "json" ? "JSON" : "CSV"})
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Requested {exp.requestedAt}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {exp.fileSize && (
                                            <span className="text-xs text-muted-foreground">
                                                {exp.fileSize}
                                            </span>
                                        )}
                                        {statusBadge(exp.status)}
                                        {exp.status === "ready" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Notice */}
                <Card className="border-warning/20 bg-warning/5">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Privacy Notice</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Your export will include all personal data associated with your
                                    account. Export files are encrypted and automatically deleted
                                    after 7 days. To request data deletion, contact your
                                    organization administrator.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
