"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { humanizeSnakeCase } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

interface ScanResultDisplayProps {
    result: string;
    message: string;
    assigneeName?: string | undefined;
    credentialTypeName?: string | undefined;
    credentialTypeColor?: string | undefined;
    barcodeValue?: string | undefined;
}

const RESULT_CONFIG: Record<
    string,
    {
        icon: typeof ShieldCheck;
        colorClass: string;
        borderClass: string;
    }
> = {
    valid: {
        icon: ShieldCheck,
        colorClass: "text-success",
        borderClass: "border-success/50 bg-success/5",
    },
    denied: {
        icon: XCircle,
        colorClass: "text-destructive",
        borderClass: "border-destructive/50 bg-destructive/5",
    },
    revoked: {
        icon: XCircle,
        colorClass: "text-destructive",
        borderClass: "border-destructive/50 bg-destructive/5",
    },
    zone_denied: {
        icon: ShieldAlert,
        colorClass: "text-warning",
        borderClass: "border-warning/50 bg-warning/5",
    },
    expired: {
        icon: ShieldAlert,
        colorClass: "text-muted-foreground",
        borderClass: "border-border bg-muted/30",
    },
    not_found: {
        icon: XCircle,
        colorClass: "text-destructive",
        borderClass: "border-destructive/50 bg-destructive/5",
    },
};

export function ScanResultDisplay({
    result,
    message,
    assigneeName,
    credentialTypeName,
    credentialTypeColor,
    barcodeValue,
}: ScanResultDisplayProps) {
    const config = (RESULT_CONFIG[result] ?? RESULT_CONFIG.denied)!;
    const Icon = config.icon;

    return (
        <Card className={`border-2 ${config.borderClass} transition-colors`}>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                    <Icon className={`h-16 w-16 ${config.colorClass}`} />
                    <h2 className="text-xl font-bold capitalize">{result.replace("_", " ")}</h2>
                    <p className="text-sm text-muted-foreground">{message}</p>

                    {assigneeName && (
                        <div className="mt-4 p-4 rounded-lg bg-card border w-full max-w-sm">
                            <p className="text-sm font-bold">{assigneeName}</p>
                            {credentialTypeName && (
                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                    {credentialTypeColor && (
                                        <span
                                            className="inline-block h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: credentialTypeColor }}
                                        />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {credentialTypeName}
                                    </span>
                                </div>
                            )}
                            {barcodeValue && (
                                <p className="density-caption font-mono text-muted-foreground mt-1">
                                    {barcodeValue}
                                </p>
                            )}
                        </div>
                    )}

                    <Badge
                        variant={
                            result === "valid"
                                ? "success"
                                : result === "zone_denied"
                                  ? "warning"
                                  : "destructive"
                        }
                        className="density-caption"
                    >
                        {humanizeSnakeCase(result)}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
