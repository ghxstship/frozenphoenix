"use client";

import * as React from "react";
import { Clock, Package, Plus, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryTypeBadge } from "@/components/advancing/advance-status-badge";
import { useCatalogItem, useCatalogItemModifiers } from "@/lib/supabase/hooks-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { CatalogCategoryType } from "@/types";

interface CatalogItemDetailProps {
    itemId: string;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: {
        catalog_item_id: string;
        name: string;
        sku: string;
        unit_cost: number;
        thumbnail_url?: string;
        is_critical_path: boolean;
    }) => void;
}

export function CatalogItemDetail({
    itemId,
    isOpen,
    onClose,
    onAddToCart,
}: CatalogItemDetailProps) {
    const { data: item, isLoading } = useCatalogItem(itemId);
    const { data: modifiers } = useCatalogItemModifiers(itemId);

    const rec = item as Record<string, unknown> | undefined;
    const mods = (modifiers as Record<string, unknown>[] | undefined) ?? [];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Catalog item detail"
        >
            <div
                className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-background shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Close detail"
                >
                    <X className="h-4 w-4" />
                </button>

                {isLoading || !rec ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-6">
                        {/* Thumbnail */}
                        {Boolean(rec.thumbnail_url) && (
                            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic external URLs from Supabase Storage */}
                                <img
                                    src={String(rec.thumbnail_url)}
                                    alt={String(rec.name)}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">{String(rec.name)}</h2>
                                {Boolean(rec.is_active) && (
                                    <Badge variant="success" className="text-[10px]">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                                SKU: {String(rec.sku)}
                            </p>
                        </div>

                        {/* Category + tags */}
                        <div className="flex flex-wrap items-center gap-2">
                            {Boolean(rec.catalog_categories) && (
                                <CategoryTypeBadge
                                    type={
                                        (rec.catalog_categories as Record<string, unknown>)
                                            ?.category_type as CatalogCategoryType
                                    }
                                />
                            )}
                            {Boolean(rec.tags) &&
                                (rec.tags as string[]).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="gap-1 text-[10px]"
                                    >
                                        <Tag className="h-2.5 w-2.5" />
                                        {tag}
                                    </Badge>
                                ))}
                        </div>

                        {/* Description */}
                        {Boolean(rec.description) && (
                            <p className="text-sm text-muted-foreground">
                                {String(rec.description)}
                            </p>
                        )}

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Unit:</span>
                                <span className="font-medium">
                                    {String(rec.unit_of_measure ?? "ea")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Lead:</span>
                                <span className="font-medium">
                                    {Number(rec.lead_time_days ?? 0)}d
                                </span>
                            </div>
                            {Boolean(rec.min_order_qty) && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Min qty: </span>
                                    <span className="font-medium">{Number(rec.min_order_qty)}</span>
                                </div>
                            )}
                            {Boolean(rec.max_order_qty) && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Max qty: </span>
                                    <span className="font-medium">{Number(rec.max_order_qty)}</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between rounded-md bg-secondary/30 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Base Price</span>
                            <span className="text-xl font-bold">
                                {formatAdvanceCost(Number(rec.base_cost ?? 0))}
                            </span>
                        </div>

                        {/* Modifiers */}
                        {mods.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Available Modifiers</h3>
                                <div className="space-y-1.5">
                                    {mods.map((mod) => (
                                        <div
                                            key={mod.id as string}
                                            className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                                        >
                                            <span>{String(mod.name)}</span>
                                            <span className="font-medium">
                                                +
                                                {formatAdvanceCost(
                                                    Number(mod.price_adjustment ?? 0)
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to cart */}
                        <Button
                            className="w-full"
                            onClick={() => {
                                onAddToCart({
                                    catalog_item_id: rec.id as string,
                                    name: String(rec.name),
                                    sku: String(rec.sku),
                                    unit_cost: Number(rec.base_cost ?? 0),
                                    thumbnail_url: rec.thumbnail_url
                                        ? String(rec.thumbnail_url)
                                        : undefined,
                                    is_critical_path: Boolean(rec.is_critical_path),
                                });
                                onClose();
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add to Advance
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
