"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";

interface AssignmentRowProps {
    assigneeName: string;
    assigneeEmail: string | null;
    barcodeValue: string;
    status: string;
    credentialTypeName: string | null;
    credentialTypeColor: string | null;
    zoneAccess: string[];
    checkedInAt: string | null;
    onClick?: () => void;
}

const STATUS_VARIANTS: Record<string, "success" | "info" | "warning" | "ghost" | "destructive"> = {
    requested: "ghost",
    approved: "info",
    issued: "info",
    checked_in: "success",
    checked_out: "warning",
    revoked: "destructive",
    expired: "ghost",
};

export function AssignmentRow({
    assigneeName,
    assigneeEmail,
    barcodeValue,
    status,
    credentialTypeName,
    credentialTypeColor,
    zoneAccess,
    checkedInAt,
    onClick,
}: AssignmentRowProps) {
    return (
        <div
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{assigneeName}</p>
                    {assigneeEmail && (
                        <p className="text-[10px] text-muted-foreground truncate">{assigneeEmail}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {credentialTypeName && (
                    <div className="flex items-center gap-1.5">
                        {credentialTypeColor && (
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: credentialTypeColor }}
                            />
                        )}
                        <span className="text-[11px] text-muted-foreground">{credentialTypeName}</span>
                    </div>
                )}

                <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <QrCode className="h-3 w-3" />
                    {barcodeValue}
                </span>

                {zoneAccess.length > 0 && (
                    <div className="hidden sm:flex gap-1">
                        {zoneAccess.slice(0, 2).map((z) => (
                            <Badge key={z} variant="ghost" className="text-[9px]">{z}</Badge>
                        ))}
                    </div>
                )}

                <Badge variant={STATUS_VARIANTS[status] ?? "ghost"} className="text-[10px] capitalize">
                    {status.replace("_", " ")}
                </Badge>

                {checkedInAt && (
                    <span className="text-[10px] text-muted-foreground">
                        {new Date(checkedInAt).toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
}
