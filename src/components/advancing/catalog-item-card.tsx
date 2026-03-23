"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATALOG_ITEM_STATUS_MAP, formatAdvanceCost } from "@/config/advancing-config";
import type { CatalogItemStatus } from "@/types";

interface CatalogItemCardProps {
    item: Record<string, unknown>;
    onAddToCart: () => void;
    className?: string | undefined;
}

export function CatalogItemCard({ item, onAddToCart, className }: CatalogItemCardProps) {
    const name = item.name as string;
    const sku = item.sku as string;
    const description = item.description as string | undefined;
    const unitCost = item.default_unit_cost as number;
    const status = item.status as CatalogItemStatus;
    const thumbnailUrl = item.thumbnail_url as string | undefined;
    const isCriticalPath = item.is_critical_path as boolean;
    const tags = (item.tags as string[] | undefined) ?? [];
    const statusConfig = CATALOG_ITEM_STATUS_MAP[status];

    const isAvailable = status === "active" || status === "seasonal";

    return (
        <div
            className={cn(
                "group relative flex flex-col rounded-lg border bg-card transition-shadow hover:shadow-md",
                !isAvailable && "opacity-60",
                className
            )}
        >
            {/* Thumbnail */}
            {thumbnailUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
                    <Image
                        src={thumbnailUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-t-lg bg-muted">
                    <span className="text-3xl text-muted-foreground/40">
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium">{name}</h3>
                        <p className="text-xs text-muted-foreground">SKU: {sku}</p>
                    </div>
                    {isCriticalPath && (
                        <AlertTriangle
                            className="h-4 w-4 shrink-0 text-warning"
                            aria-label="Critical path item"
                        />
                    )}
                </div>

                {description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
                )}

                <div className="flex flex-wrap gap-1">
                    {statusConfig && (
                        <Badge variant={statusConfig.variant} className="density-caption">
                            {statusConfig.label}
                        </Badge>
                    )}
                    {tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="density-caption">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold">{formatAdvanceCost(unitCost)}</span>
                    <button
                        onClick={onAddToCart}
                        disabled={!isAvailable}
                        className={cn(
                            "inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium transition-colors",
                            isAvailable
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "cursor-not-allowed bg-muted text-muted-foreground"
                        )}
                        aria-label={`Add ${name} to advance`}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
