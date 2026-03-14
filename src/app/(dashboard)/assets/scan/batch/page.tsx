"use client";

/* ═══════════════════════════════════════════════════════════════
   BATCH ASSET SCANNER — Scan multiple assets in sequence for
   bulk operations. Accumulates scans then submits as a batch.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Download, Layers, Loader2, Package, Trash2, XCircle } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { ScanFeedback, ScanInput } from "@/components/scanning";
import type { ScanFeedbackResult, ScanMethod } from "@/components/scanning";
import {
    type AssetScanAction,
    type AssetScanResult,
    useAssetScan,
} from "@/lib/supabase/hooks-scanning";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.assetScanner;
const FEEDBACK_S = SCANNING_STRINGS.feedback;

const SCAN_ACTIONS: { value: AssetScanAction; label: string }[] = [
    { value: "check_in", label: S.checkIn },
    { value: "check_out", label: S.checkOut },
    { value: "verify", label: S.verify },
    { value: "count", label: S.count },
    { value: "audit", label: S.audit },
    { value: "receive", label: S.receive },
    { value: "ship", label: S.ship },
];

interface BatchEntry {
    identifier: string;
    result: AssetScanResult | null;
    status: "pending" | "success" | "error";
    error?: string;
}

export default function BatchAssetScannerPage() {
    const [scanAction, setScanAction] = useState<AssetScanAction>("verify");
    const [entries, setEntries] = useState<BatchEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({
        visible: false,
        result: "info" as ScanFeedbackResult,
        message: "",
    });

    const assetScan = useAssetScan();

    // Add to batch without submitting
    const handleScan = useCallback(
        (value: string, _method: ScanMethod) => {
            // Deduplicate
            if (entries.some((e) => e.identifier === value)) {
                setFeedback({
                    visible: true,
                    result: "warning",
                    message: "Already in batch",
                });
                return;
            }
            setEntries((prev) => [...prev, { identifier: value, result: null, status: "pending" }]);
            setFeedback({
                visible: true,
                result: "info",
                message: `Added to batch (${entries.length + 1} items)`,
            });
        },
        [entries]
    );

    // Submit all pending entries
    const handleSubmitAll = useCallback(async () => {
        setIsSubmitting(true);
        const pending = entries.filter((e) => e.status === "pending");

        for (const entry of pending) {
            try {
                const result = await assetScan.mutateAsync({
                    identifier: entry.identifier,
                    scan_action: scanAction,
                    scan_method: "keyboard",
                });
                setEntries((prev) =>
                    prev.map((e) =>
                        e.identifier === entry.identifier
                            ? { ...e, result, status: result.success ? "success" : "error" }
                            : e
                    )
                );
            } catch (err) {
                setEntries((prev) =>
                    prev.map((e) =>
                        e.identifier === entry.identifier
                            ? {
                                  ...e,
                                  status: "error",
                                  error: err instanceof Error ? err.message : "Failed",
                              }
                            : e
                    )
                );
            }
        }

        setIsSubmitting(false);
        setFeedback({
            visible: true,
            result: "success",
            message: FEEDBACK_S.success,
        });
    }, [entries, scanAction, assetScan]);

    const handleClear = () => setEntries([]);

    const handleExportCsv = () => {
        const rows = entries.map((e) => ({
            identifier: e.identifier,
            status: e.status,
            asset_name: e.result?.asset ? String(e.result.asset.name ?? "") : "",
            action: scanAction,
            message: e.result?.message ?? e.error ?? "",
            timestamp: e.result?.timestamp ?? "",
        }));
        const header = Object.keys(rows[0] ?? {}).join(",");
        const body = rows
            .map((r) =>
                Object.values(r)
                    .map((v) => `"${v}"`)
                    .join(",")
            )
            .join("\n");
        const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch-scan-${scanAction}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const pendingCount = entries.filter((e) => e.status === "pending").length;
    const successCount = entries.filter((e) => e.status === "success").length;
    const errorCount = entries.filter((e) => e.status === "error").length;

    return (
        <PermissionGate resource="assets" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader title={S.batchTitle} description={S.batchSubtitle} />

                <ScanFeedback
                    result={feedback.result}
                    message={feedback.message}
                    visible={feedback.visible}
                    onDismiss={() => setFeedback((f) => ({ ...f, visible: false }))}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="w-full max-w-md mx-auto">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">
                                        {S.scanType}
                                    </label>
                                    <Select
                                        value={scanAction}
                                        onValueChange={(v) => setScanAction(v as AssetScanAction)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SCAN_ACTIONS.map((a) => (
                                                <SelectItem key={a.value} value={a.value}>
                                                    {a.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full max-w-md mx-auto">
                                    <ScanInput
                                        onScan={handleScan}
                                        placeholder={SCANNING_STRINGS.input.assetPlaceholder}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Batch list */}
                        {entries.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Layers className="h-4 w-4" />
                                            Batch ({entries.length})
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {entries.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleExportCsv}
                                                    disabled={isSubmitting}
                                                >
                                                    <Download className="h-3 w-3 mr-1" />
                                                    {S.batchExport}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleClear}
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                {S.batchClear}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {entries.map((entry, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center justify-between p-2 rounded-lg border ${
                                                    entry.status === "success"
                                                        ? "border-success/20 bg-success/5"
                                                        : entry.status === "error"
                                                          ? "border-destructive/20 bg-destructive/5"
                                                          : "border-border"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {entry.status === "success" && (
                                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                    )}
                                                    {entry.status === "error" && (
                                                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                                    )}
                                                    {entry.status === "pending" && (
                                                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-mono truncate">
                                                            {entry.identifier}
                                                        </p>
                                                        {entry.result?.asset && (
                                                            <p className="text-[10px] text-muted-foreground truncate">
                                                                {String(
                                                                    entry.result.asset.name ?? ""
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        entry.status === "success"
                                                            ? "success"
                                                            : entry.status === "error"
                                                              ? "destructive"
                                                              : "secondary"
                                                    }
                                                    className="text-[9px] shrink-0"
                                                >
                                                    {entry.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                    {pendingCount > 0 && (
                                        <Button
                                            className="w-full mt-4"
                                            onClick={handleSubmitAll}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                S.batchSubmit.replace(
                                                    "{count}",
                                                    String(pendingCount)
                                                )
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Stats sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Batch Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-medium">{entries.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Pending</span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {pendingCount}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Success</span>
                                    <Badge variant="success" className="text-[10px]">
                                        {successCount}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Errors</span>
                                    <Badge variant="destructive" className="text-[10px]">
                                        {errorCount}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PermissionGate>
    );
}
