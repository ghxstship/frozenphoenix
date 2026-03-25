"use client";

/* ═══════════════════════════════════════════════════════════════
   DUPLICATE ORDER WARNING — Alert for potential PO duplicates (GAP-PRC-01)

   Displays a dismissible warning banner when the
   useDuplicateOrderDetection hook finds existing POs that
   match the current vendor + amount combination.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from "react";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DuplicateCandidate } from "@/lib/data-hooks/hooks-feature-gaps";
import { AlertTriangle, ExternalLink, X } from "lucide-react";

export interface DuplicateOrderWarningProps {
    /** Duplicate candidates from useDuplicateOrderDetection */
    candidates: DuplicateCandidate[];
    /** Whether the detection query is still loading */
    isLoading?: boolean | undefined;
    /** Called when user explicitly dismisses */
    onDismiss?: (() => void) | undefined;
}

export function DuplicateOrderWarning({
    candidates,
    isLoading = false,
    onDismiss,
}: DuplicateOrderWarningProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || isLoading || candidates.length === 0) return null;

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    return (
        <div className="motion-safe:animate-fade-in space-y-2">
            <AlertBanner
                message={`Potential duplicate detected: ${candidates.length} existing order${candidates.length > 1 ? "s" : ""} match this vendor and amount`}
                severity="warning"
                icon={AlertTriangle}
            />
            <Card className="border-warning/30 bg-warning/5">
                <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                            <p className="text-sm font-medium text-warning-foreground">
                                Review existing orders before proceeding:
                            </p>
                            <ul className="space-y-1.5">
                                {candidates.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {c.po_number || "—"}
                                        </span>
                                        <span>
                                            {c.vendor_name} — ${c.total_amount.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground/60">
                                            ({c.similarity}% match: {c.matchReasons.join(", ")})
                                        </span>
                                        <a
                                            href={`/purchase-orders/${c.id}`}
                                            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                                        >
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="shrink-0"
                            aria-label="Dismiss duplicate warning"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

DuplicateOrderWarning.displayName = "DuplicateOrderWarning";
