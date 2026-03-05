"use client";

import React, { useState } from "react";
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
    Shield,
    User,
} from "lucide-react";
import type { DataExportStatus } from "@/types";
import { PermissionGate } from "@/components/permission-guard";

// TODO: Wire to Supabase when data_exports table is available

interface ExportRequest {
    id: string;
    format: "json" | "csv";
    status: DataExportStatus;
    requestedAt: string;
    completedAt: string | null;
    fileSize: string | null;
}

const mockExports: ExportRequest[] = [
    {
        id: "1",
        format: "json",
        status: "ready",
        requestedAt: "2025-02-24 14:30",
        completedAt: "2025-02-24 14:32",
        fileSize: "2.4 MB",
    },
    {
        id: "2",
        format: "csv",
        status: "expired",
        requestedAt: "2025-02-17 09:00",
        completedAt: "2025-02-17 09:05",
        fileSize: "1.8 MB",
    },
    {
        id: "3",
        format: "json",
        status: "downloaded",
        requestedAt: "2025-02-20 11:15",
        completedAt: "2025-02-20 11:18",
        fileSize: "3.1 MB",
    },
];

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

export default function DataExportPage() {
    const [requestingFormat, setRequestingFormat] = useState<"json" | "csv" | null>(null);

    const handleRequestExport = (format: "json" | "csv") => {
        setRequestingFormat(format);
        setTimeout(() => setRequestingFormat(null), 2000);
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
                        value={mockExports.length}
                        icon={Download}
                        description="All time"
                    />
                    <StatCard
                        title="Available"
                        value={mockExports.filter((e) => e.status === "ready").length}
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
                                disabled={requestingFormat !== null}
                                className="flex items-center gap-2"
                            >
                                <FileJson className="h-4 w-4" />
                                {requestingFormat === "json" ? "Requesting..." : "Export as JSON"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRequestExport("csv")}
                                disabled={requestingFormat !== null}
                                className="flex items-center gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {requestingFormat === "csv" ? "Requesting..." : "Export as CSV"}
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
                            {mockExports.map((exp) => (
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
