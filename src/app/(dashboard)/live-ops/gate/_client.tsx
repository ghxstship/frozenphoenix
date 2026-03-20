"use client";

import React, { useCallback, useMemo, useState } from "react";
import { enumLabel, SCAN_RESULT_LABELS } from "@/lib/enum-labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, LogIn, LogOut, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { ScanFeedback, ScanInput } from "@/components/scanning";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import type { ScanFeedbackResult, ScanMethod } from "@/components/scanning";
import {
    type GateScanResult,
    useGateScan,
    useGateScanHistory,
} from "@/lib/supabase/hooks-credentialing";
import { GateScanSheet } from "./scan-sheet";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";
import { useWedgeScanner } from "@/hooks/use-wedge-scanner";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { OfflineIndicator } from "@/components/scanning/offline-indicator";

const S = SCANNING_STRINGS.gateScanner;
const FEEDBACK_S = SCANNING_STRINGS.feedback;

/** Map ScanInput method → API scan_method value */
type ApiScanMethod = "keyboard" | "camera" | "rfid" | "nfc" | "file" | "api";
const METHOD_MAP: Record<ScanMethod, ApiScanMethod> = {
    keyboard: "keyboard",
    camera: "camera",
    nfc: "nfc",
};

/** Map API result → ScanFeedback result type */
function toFeedbackResult(result: string): ScanFeedbackResult {
    if (result === "valid") return "success";
    if (result === "zone_denied" || result === "flagged") return "warning";
    if (result === "expired") return "info";
    return "error";
}

/** Map API result → human-readable feedback message */
function toFeedbackMessage(result: string): string {
    const map: Record<string, string> = {
        valid: FEEDBACK_S.success,
        denied: FEEDBACK_S.denied,
        revoked: FEEDBACK_S.revoked,
        expired: FEEDBACK_S.expired,
        zone_denied: FEEDBACK_S.zoneDenied,
        flagged: FEEDBACK_S.flagged,
    };
    return map[result] ?? FEEDBACK_S.error;
}

export function GateScannerPageClient() {
    const [scanType, setScanType] = useState<"check_in" | "check_out">("check_in");
    const [lastResult, setLastResult] = useState<GateScanResult | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [feedback, setFeedback] = useState({
        visible: false,
        result: "info" as ScanFeedbackResult,
        message: "",
    });

    const gateScan = useGateScan();
    const { data: sbHistory } = useGateScanHistory(50);
    const { isOnline, pendingCount, isSyncing, syncNow, clearPending } = useOfflineSync();

    const scanHistory: { result: string; assignee_name: string | null; timestamp: string }[] = (
        sbHistory ?? []
    ).map((h: Record<string, unknown>) => ({
        result: (h.scan_result as string) ?? "",
        assignee_name:
            ((h.credential_assignments as Record<string, unknown>)?.assignee_name as string) ??
            null,
        timestamp: (h.scanned_at as string) ?? "",
    }));

    const handleScan = useCallback(
        async (value: string, method: ScanMethod) => {
            try {
                const result = await gateScan.mutateAsync({
                    identifier: value,
                    scan_type: scanType,
                    scan_method: METHOD_MAP[method],
                });
                setLastResult(result);
                setFeedback({
                    visible: true,
                    result: toFeedbackResult(result.result),
                    message: toFeedbackMessage(result.result),
                });
            } catch {
                setLastResult({
                    result: "error",
                    assignment: null,
                    credential_type: null,
                    message: "Network error — please retry",
                    timestamp: new Date().toISOString(),
                });
                setFeedback({
                    visible: true,
                    result: "error",
                    message: FEEDBACK_S.error,
                });
            }
        },
        [scanType, gateScan]
    );

    useWedgeScanner({
        onScan: (value) => handleScan(value, "keyboard"),
        enabled: true,
        minLength: 4,
    });

    const resultIcon = useMemo(
        () =>
            lastResult?.result === "valid" ? (
                <ShieldCheck className="h-16 w-16 text-success" />
            ) : lastResult?.result === "denied" || lastResult?.result === "revoked" ? (
                <XCircle className="h-16 w-16 text-destructive" />
            ) : lastResult?.result === "zone_denied" ? (
                <ShieldAlert className="h-16 w-16 text-warning" />
            ) : lastResult?.result === "expired" ? (
                <ShieldAlert className="h-16 w-16 text-muted-foreground" />
            ) : null,
        [lastResult?.result]
    );

    const resultColor =
        lastResult?.result === "valid"
            ? "border-success/50 bg-success/5"
            : lastResult?.result === "zone_denied"
              ? "border-warning/50 bg-warning/5"
              : lastResult
                ? "border-destructive/50 bg-destructive/5"
                : "border-border bg-card";

    const config: DashboardPageConfig = useMemo(
        () => ({
            resource: "gate_operations",
            action: "read",
            title: S.title,
            description: "Scan credentials for check-in / check-out at entry points",
            searchable: false,
            contentSlot: (
                <>
                    <OfflineIndicator
                        isOnline={isOnline}
                        pendingCount={pendingCount}
                        isSyncing={isSyncing}
                        onSyncNow={syncNow}
                        onClearPending={clearPending}
                    />

                    {/* Audio/haptic/visual feedback toast */}
                    <ScanFeedback
                        result={feedback.result}
                        message={feedback.message}
                        visible={feedback.visible}
                        onDismiss={() => setFeedback((f) => ({ ...f, visible: false }))}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 density-gap-card">
                        <div className="lg:col-span-2 density-gap-page">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center density-gap-page">
                                        <div className="flex items-center gap-2 w-full max-w-md">
                                            <Button
                                                size="sm"
                                                variant={
                                                    scanType === "check_in" ? "default" : "outline"
                                                }
                                                onClick={() => setScanType("check_in")}
                                            >
                                                <LogIn className="h-4 w-4" />
                                                Check In
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={
                                                    scanType === "check_out" ? "default" : "outline"
                                                }
                                                onClick={() => setScanType("check_out")}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Check Out
                                            </Button>
                                        </div>

                                        {/* Multi-method scan input (keyboard + camera + NFC) */}
                                        <div className="w-full max-w-md">
                                            <ScanInput
                                                onScan={handleScan}
                                                placeholder={
                                                    SCANNING_STRINGS.input.credentialPlaceholder
                                                }
                                                disabled={gateScan.isPending}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {lastResult && (
                                <Card
                                    className={`border-2 ${resultColor} transition-colors cursor-pointer`}
                                    onClick={() => setSheetOpen(true)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setSheetOpen(true)}
                                    aria-label="View scan details"
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            {resultIcon}
                                            <h2 className="text-xl font-bold capitalize">
                                                {lastResult.result.replaceAll("_", " ")}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {lastResult.message}
                                            </p>

                                            {lastResult.assignment && (
                                                <div className="mt-4 p-4 rounded-lg bg-card border w-full max-w-sm">
                                                    <p className="text-sm font-bold">
                                                        {String(
                                                            lastResult.assignment.assignee_name ??
                                                                ""
                                                        )}
                                                    </p>
                                                    {lastResult.credential_type && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            {typeof (
                                                                lastResult.credential_type as Record<
                                                                    string,
                                                                    unknown
                                                                >
                                                            ).color_hex === "string" && (
                                                                <span
                                                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                                                    style={{
                                                                        backgroundColor: (
                                                                            lastResult.credential_type as Record<
                                                                                string,
                                                                                unknown
                                                                            >
                                                                        ).color_hex as string,
                                                                    }}
                                                                />
                                                            )}
                                                            <span className="text-xs text-muted-foreground">
                                                                {String(
                                                                    (
                                                                        lastResult.credential_type as Record<
                                                                            string,
                                                                            unknown
                                                                        >
                                                                    ).name ?? ""
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="density-caption font-mono text-muted-foreground mt-1">
                                                        {String(
                                                            lastResult.assignment.barcode_value ??
                                                                ""
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="density-caption text-muted-foreground mt-2">
                                                Tap for details
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4" />
                                    Scan History ({scanHistory.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {scanHistory.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No scans yet
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                        {scanHistory.map((s, i) => (
                                            <div
                                                key={i}
                                                className={`p-2 rounded-lg border ${
                                                    s.result === "valid"
                                                        ? "border-success/20"
                                                        : "border-destructive/20"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant={
                                                            s.result === "valid"
                                                                ? "success"
                                                                : "destructive"
                                                        }
                                                        className="density-caption"
                                                    >
                                                        {enumLabel(s.result, SCAN_RESULT_LABELS)}
                                                    </Badge>
                                                    <span className="density-caption text-muted-foreground">
                                                        {new Date(s.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                {s.assignee_name && (
                                                    <p className="text-xs mt-1 truncate">
                                                        {s.assignee_name}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Scan detail sheet (slide-over) */}
                    <GateScanSheet
                        result={lastResult}
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                    />
                </>
            ),
        }),
        [
            isOnline,
            pendingCount,
            isSyncing,
            syncNow,
            clearPending,
            feedback,
            scanType,
            handleScan,
            gateScan.isPending,
            lastResult,
            resultIcon,
            resultColor,
            sheetOpen,
            scanHistory,
        ]
    );

    return (
        <OperationalDashboardShell
            config={config}
            data={scanHistory as unknown as Record<string, unknown>[]}
            isLoading={false}
        />
    );
}
