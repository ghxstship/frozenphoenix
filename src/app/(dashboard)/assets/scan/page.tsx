"use client";

/* ═══════════════════════════════════════════════════════════════
   ASSET SCANNER — Single-scan page for asset check-in, check-out,
   transfer, verify, damage reporting, and inventory actions.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useState } from "react";
import { PageShell } from "@/components/layouts/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BadgeCheck, CheckCircle2, MapPin, Package, QrCode, XCircle } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { ScanFeedback, ScanInput } from "@/components/scanning";
import type { ScanFeedbackResult, ScanMethod } from "@/components/scanning";
import {
    type AssetScanAction,
    type AssetScanResult,
    useAssetLookup,
    useAssetScan,
} from "@/lib/supabase/hooks-scanning";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";
import { useWedgeScanner } from "@/hooks/use-wedge-scanner";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { OfflineIndicator } from "@/components/scanning/offline-indicator";

const S = SCANNING_STRINGS.assetScanner;
const FEEDBACK_S = SCANNING_STRINGS.feedback;

const SCAN_ACTIONS: { value: AssetScanAction; label: string }[] = [
    { value: "check_in", label: S.checkIn },
    { value: "check_out", label: S.checkOut },
    { value: "transfer", label: S.transfer },
    { value: "verify", label: S.verify },
    { value: "count", label: S.count },
    { value: "damage", label: S.damage },
    { value: "audit", label: S.audit },
    { value: "receive", label: S.receive },
    { value: "ship", label: S.ship },
];

const METHOD_MAP: Record<ScanMethod, "keyboard" | "camera" | "nfc"> = {
    keyboard: "keyboard",
    camera: "camera",
    nfc: "nfc",
};

export default function AssetScannerPage() {
    const [scanAction, setScanAction] = useState<AssetScanAction>("verify");
    const [lastResult, setLastResult] = useState<AssetScanResult | null>(null);
    const [history, setHistory] = useState<AssetScanResult[]>([]);
    const { data: _assetLookup } = useAssetLookup(null);
    const [feedback, setFeedback] = useState({
        visible: false,
        result: "info" as ScanFeedbackResult,
        message: "",
    });

    const assetScan = useAssetScan();
    const { isOnline, pendingCount, isSyncing, syncNow, clearPending } = useOfflineSync();

    const handleScan = useCallback(
        async (value: string, method: ScanMethod) => {
            try {
                const result = await assetScan.mutateAsync({
                    identifier: value,
                    scan_action: scanAction,
                    scan_method: METHOD_MAP[method],
                });
                setLastResult(result);
                setHistory((prev) => [result, ...prev].slice(0, 100));
                setFeedback({
                    visible: true,
                    result: result.success ? "success" : "error",
                    message: result.success ? FEEDBACK_S.success : FEEDBACK_S.error,
                });
            } catch {
                setFeedback({
                    visible: true,
                    result: "error",
                    message: FEEDBACK_S.error,
                });
            }
        },
        [scanAction, assetScan]
    );

    useWedgeScanner({
        onScan: (value) => handleScan(value, "keyboard"),
        enabled: true,
        minLength: 4,
    });

    return (
        <PermissionGate resource="assets" action="read">
            <PageShell title={S.title} description={S.subtitle}>
                <OfflineIndicator
                    isOnline={isOnline}
                    pendingCount={pendingCount}
                    isSyncing={isSyncing}
                    onSyncNow={syncNow}
                    onClearPending={clearPending}
                />

                <ScanFeedback
                    result={feedback.result}
                    message={feedback.message}
                    visible={feedback.visible}
                    onDismiss={() => setFeedback((f) => ({ ...f, visible: false }))}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Scan type selector */}
                                    <div className="w-full max-w-md">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">
                                            {S.scanType}
                                        </label>
                                        <Select
                                            value={scanAction}
                                            onValueChange={(v) =>
                                                setScanAction(v as AssetScanAction)
                                            }
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

                                    {/* Multi-method scan input */}
                                    <div className="w-full max-w-md">
                                        <ScanInput
                                            onScan={handleScan}
                                            placeholder={SCANNING_STRINGS.input.assetPlaceholder}
                                            disabled={assetScan.isPending}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Last scan result */}
                        {lastResult && (
                            <Card
                                className={`border-2 transition-colors ${
                                    lastResult.success
                                        ? "border-success/50 bg-success/5"
                                        : "border-destructive/50 bg-destructive/5"
                                }`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        {lastResult.success ? (
                                            <CheckCircle2 className="h-12 w-12 text-success" />
                                        ) : (
                                            <XCircle className="h-12 w-12 text-destructive" />
                                        )}
                                        <h2 className="text-lg font-bold">{lastResult.message}</h2>

                                        {lastResult.asset && (
                                            <div className="mt-3 p-4 rounded-lg bg-card border w-full max-w-sm text-left">
                                                <p className="text-sm font-bold">
                                                    {String(lastResult.asset.name ?? "")}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Package className="h-3 w-3" />
                                                    {String(lastResult.asset.category ?? "")}
                                                </div>
                                                {typeof lastResult.asset.location === "string" && (
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {lastResult.asset.location}
                                                    </div>
                                                )}
                                                {typeof lastResult.asset.barcode === "string" && (
                                                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                                                        <QrCode className="h-3 w-3" />
                                                        {lastResult.asset.barcode}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Scan History Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <BadgeCheck className="h-4 w-4" />
                                {S.recentScans} ({history.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No scans yet
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {history.map((s, i) => (
                                        <div
                                            key={i}
                                            className={`p-2 rounded-lg border ${
                                                s.success
                                                    ? "border-success/20"
                                                    : "border-destructive/20"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant={s.success ? "success" : "destructive"}
                                                    className="text-[9px]"
                                                >
                                                    {s.scan_action.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(s.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {s.asset && (
                                                <p className="text-xs mt-1 truncate">
                                                    {String(s.asset.name ?? "")}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
        </PermissionGate>
    );
}
