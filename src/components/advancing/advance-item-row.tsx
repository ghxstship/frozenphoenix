"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvanceItemStatusBadge } from "@/components/advancing/advance-status-badge";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceItemStatus } from "@/types";

interface AdvanceItemRowProps {
    item: Record<string, unknown>;
    onStatusChange?: (itemId: string, status: AdvanceItemStatus) => void;
    onDelete?: (itemId: string) => void;
    readOnly?: boolean;
}

export function AdvanceItemRow({
    item,
    onStatusChange,
    onDelete,
    readOnly = false,
}: AdvanceItemRowProps) {
    const catalogItem = item.catalog_items as Record<string, unknown> | undefined;
    const name = String(catalogItem?.name ?? item.catalog_item_id);
    const sku = catalogItem ? String(catalogItem.sku ?? "") : "";
    const qty = Number(item.quantity_requested ?? 0);
    const qtyConfirmed = Number(item.quantity_confirmed ?? 0);
    const unitCost = Number(item.unit_cost ?? 0);
    const lineTotal = unitCost * qty;
    const status = item.status as AdvanceItemStatus;

    return (
        <div className="flex items-center gap-3 py-3">
            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{name}</span>
                    {Boolean(item.is_critical_path) && (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                    )}
                    <AdvanceItemStatusBadge status={status} />
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {Boolean(sku) && <span className="font-mono">{sku}</span>}
                    <span>
                        Qty: {qty}
                        {qtyConfirmed > 0 && qtyConfirmed !== qty && (
                            <span className="ml-1 text-warning">
                                (confirmed: {qtyConfirmed})
                            </span>
                        )}
                    </span>
                    <span>{formatAdvanceCost(unitCost)} ea</span>
                    {Boolean(item.notes) && (
                        <span className="italic">{String(item.notes)}</span>
                    )}
                </div>
            </div>

            {/* Total */}
            <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatAdvanceCost(lineTotal)}
            </span>

            {/* Actions */}
            {!readOnly && (
                <div className="flex items-center gap-1">
                    {onStatusChange && (
                        <select
                            value={status}
                            onChange={(e) =>
                                onStatusChange(
                                    item.id as string,
                                    e.target.value as AdvanceItemStatus
                                )
                            }
                            className="rounded border bg-background px-2 py-1 text-xs"
                            aria-label={`Change status for ${name}`}
                        >
                            <option value="pending">Pending</option>
                            <option value="sourcing">Sourcing</option>
                            <option value="ordered">Ordered</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="checked_in">Checked In</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="backordered">Backordered</option>
                            <option value="substituted">Substituted</option>
                        </select>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id as string)}
                            aria-label={`Remove ${name}`}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
