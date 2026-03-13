"use client";

import React, { useCallback, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeCheck, LogIn, LogOut, QrCode, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import {
    type GateScanResult,
    useGateScan,
    useGateScanHistory,
} from "@/lib/supabase/hooks-credentialing";

export default function GateScannerPage() {
    const [barcodeInput, setBarcodeInput] = useState("");
    const [scanType, setScanType] = useState<"check_in" | "check_out">("check_in");
    const [lastResult, setLastResult] = useState<GateScanResult | null>(null);

    const gateScan = useGateScan();
    const { data: sbHistory } = useGateScanHistory(50);

    const scanHistory: { result: string; assignee_name: string | null; timestamp: string }[] = (
        sbHistory ?? []
    ).map((h: Record<string, unknown>) => ({
        result: (h.scan_result as string) ?? "",
        assignee_name:
            ((h.credential_assignments as Record<string, unknown>)?.assignee_name as string) ??
            null,
        timestamp: (h.scanned_at as string) ?? "",
    }));

    const handleScan = useCallback(async () => {
        if (!barcodeInput.trim()) return;
        try {
            const result = await gateScan.mutateAsync({
                barcode_value: barcodeInput.trim(),
                scan_type: scanType,
            });
            setLastResult(result);
            setBarcodeInput("");
        } catch {
            setLastResult({
                result: "error",
                assignment: null,
                credential_type: null,
                message: "Network error — please retry",
                timestamp: new Date().toISOString(),
            });
        }
    }, [barcodeInput, scanType, gateScan]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleScan();
        }
    };

    const resultIcon =
        lastResult?.result === "valid" ? (
            <ShieldCheck className="h-16 w-16 text-success" />
        ) : lastResult?.result === "denied" || lastResult?.result === "revoked" ? (
            <XCircle className="h-16 w-16 text-destructive" />
        ) : lastResult?.result === "zone_denied" ? (
            <ShieldAlert className="h-16 w-16 text-warning" />
        ) : lastResult?.result === "expired" ? (
            <ShieldAlert className="h-16 w-16 text-muted-foreground" />
        ) : null;

    const resultColor =
        lastResult?.result === "valid"
            ? "border-success/50 bg-success/5"
            : lastResult?.result === "zone_denied"
              ? "border-warning/50 bg-warning/5"
              : lastResult
                ? "border-destructive/50 bg-destructive/5"
                : "border-border bg-card";

    return (
        <PermissionGate resource="gate_operations" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Gate Scanner"
                    description="Scan credentials for check-in / check-out at entry points"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-6">
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

                                    <div className="flex items-center gap-2 w-full max-w-md">
                                        <div className="relative flex-1">
                                            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                className="pl-10 text-lg h-12 font-mono"
                                                placeholder="Scan or enter barcode..."
                                                value={barcodeInput}
                                                onChange={(e) => setBarcodeInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                autoFocus
                                            />
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={handleScan}
                                            disabled={gateScan.isPending || !barcodeInput.trim()}
                                        >
                                            {gateScan.isPending ? "Scanning..." : "Scan"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {lastResult && (
                            <Card className={`border-2 ${resultColor} transition-colors`}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        {resultIcon}
                                        <h2 className="text-xl font-bold capitalize">
                                            {lastResult.result.replace("_", " ")}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {lastResult.message}
                                        </p>

                                        {lastResult.assignment && (
                                            <div className="mt-4 p-4 rounded-lg bg-card border w-full max-w-sm">
                                                <p className="text-sm font-bold">
                                                    {lastResult.assignment.assignee_name as string}
                                                </p>
                                                {lastResult.credential_type && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {!!(
                                                            lastResult.credential_type as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        ).color_hex && (
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
                                                            {
                                                                (
                                                                    lastResult.credential_type as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).name as string
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                                    {lastResult.assignment.barcode_value as string}
                                                </p>
                                            </div>
                                        )}
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
                                                    className="text-[9px]"
                                                >
                                                    {s.result.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
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
            </div>
        </PermissionGate>
    );
}
