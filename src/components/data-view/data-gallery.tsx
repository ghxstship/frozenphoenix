"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA GALLERY — Image-first grid view for visual assets

   Renders records as large thumbnail cards with title/subtitle
   overlay. Ideal for creative assets, brand kits, digital assets,
   decks, and any image-bearing entity.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageOff } from "lucide-react";

// ─── Types ───

export interface GalleryItem {
    id: string;
    imageUrl?: string | undefined;
    title: string;
    subtitle?: string | undefined;
    status?: string | undefined;
}

export interface DataGalleryProps {
    data: GalleryItem[];
    aspectRatio?: "square" | "video" | "wide" | undefined;
    className?: string | undefined;
    actions?: ((item: GalleryItem) => React.ReactNode) | undefined;
    onItemClick?: ((item: GalleryItem) => void) | undefined;
}

// ─── Aspect ratio map ───

const ASPECT_MAP: Record<string, string> = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[2/1]",
};

// ─── Component ───

export function DataGallery({
    data,
    aspectRatio = "video",
    className,
    actions,
    onItemClick,
}: DataGalleryProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No items with images to display
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 density-gap-card",
                className
            )}
            role="list"
            aria-label="Gallery view"
        >
            {data.map((item) => (
                <Button
                    key={item.id}
                    variant="ghost"
                    role="listitem"
                    className={cn(
                        "group/row relative overflow-hidden rounded-lg border bg-card text-left h-auto p-0 block w-full",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        onItemClick
                            ? "cursor-pointer hover:shadow-lg hover:border-primary/30"
                            : "cursor-default"
                    )}
                    onClick={() => onItemClick?.(item)}
                    aria-label={item.title}
                >
                    {/* Image */}
                    <div
                        className={cn(
                            "relative w-full bg-muted/20 overflow-hidden",
                            ASPECT_MAP[aspectRatio]
                        )}
                    >
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                <ImageOff className="h-10 w-10" />
                            </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Actions overlay */}
                        {actions && (
                            <div
                                className="absolute top-2 left-2 z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {actions(item)}
                            </div>
                        )}

                        {/* Status badge */}
                        {item.status && (
                            <div className="absolute top-2 right-2">
                                <Badge
                                    variant="ghost"
                                    className="bg-background/80 backdrop-blur-sm density-caption"
                                >
                                    {item.status}
                                </Badge>
                            </div>
                        )}

                        {/* Title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-sm font-medium text-white truncate">{item.title}</p>
                            {item.subtitle && (
                                <p className="density-caption text-white/70 truncate">
                                    {item.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </Button>
            ))}
        </div>
    );
}

DataGallery.displayName = "DataGallery";
