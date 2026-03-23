"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PoolCapacityBarProps {
    credentialTypeName: string;
    category: string;
    colorHex: string | null;
    totalQuantity: number;
    allocatedCount: number;
    compact?: boolean | undefined;
}

export function PoolCapacityBar({
    credentialTypeName,
    category,
    colorHex,
    totalQuantity,
    allocatedCount,
    compact = false,
}: PoolCapacityBarProps) {
    const remaining = totalQuantity - allocatedCount;
    const pct = totalQuantity > 0 ? Math.round((allocatedCount / totalQuantity) * 100) : 0;
    const urgency =
        remaining <= 0
            ? "depleted"
            : remaining < 10
              ? "low"
              : remaining < totalQuantity * 0.2
                ? "warning"
                : "healthy";

    const urgencyStyles: Record<
        string,
        { bar: string; badge: "destructive" | "warning" | "success" | "ghost" }
    > = {
        depleted: { bar: "bg-destructive", badge: "destructive" },
        low: { bar: "bg-destructive", badge: "destructive" },
        warning: { bar: "bg-warning", badge: "warning" },
        healthy: { bar: "bg-primary", badge: "success" },
    };

    const style = urgencyStyles[urgency]!;

    if (compact) {
        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between density-caption">
                    <div className="flex items-center gap-1.5">
                        {colorHex && (
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: colorHex }}
                            />
                        )}
                        <span className="font-medium">{credentialTypeName}</span>
                    </div>
                    <span className="text-muted-foreground">
                        {allocatedCount}/{totalQuantity}
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${style.bar}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            {colorHex && (
                                <span
                                    className="inline-block h-3 w-3 rounded-full"
                                    style={{ backgroundColor: colorHex }}
                                />
                            )}
                            <p className="text-sm font-bold">{credentialTypeName}</p>
                        </div>
                        <Badge variant="secondary" className="density-caption capitalize mt-1">
                            {category.replace("_", " ")}
                        </Badge>
                    </div>
                    <Badge variant={style.badge} className="density-caption">
                        {remaining} remaining
                    </Badge>
                </div>
                <div className="mt-3">
                    <div className="flex justify-between density-caption text-muted-foreground mb-1">
                        <span>{allocatedCount} allocated</span>
                        <span>{totalQuantity} total</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${style.bar}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
