"use client";

/* ═══════════════════════════════════════════════════════════════
   GATE SCAN SHEET — Slide-over detail for a credential scan result.
   Shows assignee info, credential type, zone access, and scan
   metadata. Renders inside a Sheet (drawer) from the right.
   ═══════════════════════════════════════════════════════════════ */

import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, MapPin, ShieldAlert, ShieldCheck, User, XCircle } from "lucide-react";
import type { GateScanResult } from "@/lib/supabase/hooks-credentialing";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.gateScanner;

interface GateScanSheetProps {
    result: GateScanResult | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const RESULT_META: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
    valid: { icon: ShieldCheck, color: "text-green-600", label: "Access Granted" },
    denied: { icon: XCircle, color: "text-red-600", label: "Denied" },
    revoked: { icon: XCircle, color: "text-red-600", label: "Revoked" },
    expired: { icon: Clock, color: "text-muted-foreground", label: "Expired" },
    zone_denied: { icon: ShieldAlert, color: "text-amber-600", label: "Zone Denied" },
    flagged: { icon: ShieldAlert, color: "text-amber-600", label: "Flagged" },
};

export function GateScanSheet({ result, open, onOpenChange }: GateScanSheetProps) {
    if (!result) return null;

    const meta = RESULT_META[result.result] ?? RESULT_META.denied!;
    const Icon = meta!.icon;
    const assignment = result.assignment;
    const credType = result.credential_type as Record<string, unknown> | null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", meta!.color)} />
                        {meta!.label}
                    </SheetTitle>
                    <SheetDescription>{result.message}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 density-gap-page">
                    {/* Assignee */}
                    {assignment && (
                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                {S.assignee}
                            </h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                <User className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        {String(assignment.assignee_name ?? "")}
                                    </p>
                                    {typeof assignment.assignee_email === "string" && (
                                        <p className="text-xs text-muted-foreground">
                                            {assignment.assignee_email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Credential Type */}
                    {credType && (
                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                {S.credentialType}
                            </h3>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                                {typeof credType.color_hex === "string" && (
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{ backgroundColor: credType.color_hex }}
                                    />
                                )}
                                <span className="text-sm font-medium">
                                    {String(credType.name ?? "")}
                                </span>
                                <Badge variant="secondary" className="ml-auto density-caption">
                                    {String(credType.category ?? "").replace("_", " ")}
                                </Badge>
                            </div>
                        </section>
                    )}

                    {/* Zone Access */}
                    {assignment && (assignment.zone_access as string[])?.length > 0 && (
                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {S.zoneAccess}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {(assignment.zone_access as string[]).map((z) => (
                                    <Badge key={z} variant="outline" className="density-caption">
                                        {z}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Scan Metadata */}
                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            {S.scanDetails}
                        </h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {typeof assignment?.barcode_value === "string" && (
                                <>
                                    <dt className="text-muted-foreground">{S.barcode}</dt>
                                    <dd className="font-mono text-xs">
                                        {assignment.barcode_value}
                                    </dd>
                                </>
                            )}
                            {result.matched_by && (
                                <>
                                    <dt className="text-muted-foreground">{S.matchedBy}</dt>
                                    <dd className="capitalize">{result.matched_by}</dd>
                                </>
                            )}
                            {result.scan_method && (
                                <>
                                    <dt className="text-muted-foreground">{S.method}</dt>
                                    <dd className="capitalize">{result.scan_method}</dd>
                                </>
                            )}
                            <dt className="text-muted-foreground">{S.time}</dt>
                            <dd>{new Date(result.timestamp).toLocaleTimeString()}</dd>
                        </dl>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
