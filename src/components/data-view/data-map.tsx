"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA MAP — Geo-located record visualization

   Renders records with lat/lng as markers on an interactive CSS
   grid-based map. Uses a lightweight CSS approach — no external
   map library required. Markers are plotted on a Mercator-style
   projection within the data bounds.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin } from "lucide-react";

// ─── Types ───

export interface MapItem {
    id: string;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    color?: string;
}

interface DataMapProps {
    data: MapItem[];
    className?: string;
    height?: number;
    actions?: (item: MapItem) => React.ReactNode;
    onItemClick?: (item: MapItem) => void;
}

// ─── Helpers ───

function getBounds(data: MapItem[]): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
} {
    const lats = data.map((d) => d.lat);
    const lngs = data.map((d) => d.lng);
    const padding = 0.02;
    return {
        minLat: Math.min(...lats) - padding,
        maxLat: Math.max(...lats) + padding,
        minLng: Math.min(...lngs) - padding,
        maxLng: Math.max(...lngs) + padding,
    };
}

const DEFAULT_MARKER_COLORS = [
    "text-primary",
    "text-info",
    "text-success",
    "text-warning",
    "text-destructive",
];

// ─── Component ───

export function DataMap({ data, className, height = 400, actions, onItemClick }: DataMapProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No items with location data to display
            </div>
        );
    }

    const bounds = getBounds(data);
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;

    return (
        <div className={cn("space-y-3", className)}>
            {/* Map area */}
            <div
                className="relative border rounded-lg bg-muted/10 overflow-hidden"
                style={{ height }}
                role="img"
                aria-label={`Map showing ${data.length} locations`}
            >
                {/* Grid pattern background */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Markers */}
                {data.map((item, i) => {
                    const x = ((item.lng - bounds.minLng) / lngRange) * 100;
                    const y = ((bounds.maxLat - item.lat) / latRange) * 100;
                    const colorClass =
                        item.color ?? DEFAULT_MARKER_COLORS[i % DEFAULT_MARKER_COLORS.length];
                    const markerStyle = {
                        left: `${Math.min(95, Math.max(5, x))}%`,
                        top: `${Math.min(90, Math.max(5, y))}%`,
                    };
                    const markerClass = cn(
                        "absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-125 cursor-pointer",
                        colorClass
                    );
                    const markerLabel = `${item.title} at ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`;

                    if (actions) {
                        return (
                            <DropdownMenu key={item.id}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={markerClass}
                                        style={markerStyle}
                                        aria-label={markerLabel}
                                    >
                                        <MapPin className="h-6 w-6 drop-shadow-md" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="min-w-[180px]">
                                    <DropdownMenuLabel className="font-medium">
                                        {item.title}
                                    </DropdownMenuLabel>
                                    {item.subtitle && (
                                        <p className="px-2 pb-1.5 density-caption text-muted-foreground">
                                            {item.subtitle}
                                        </p>
                                    )}
                                    <DropdownMenuSeparator />
                                    {actions(item)}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        );
                    }

                    return (
                        <Tooltip
                            key={item.id}
                            content={
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    {item.subtitle && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                            }
                            side="top"
                        >
                            <button
                                type="button"
                                className={markerClass}
                                style={markerStyle}
                                onClick={() => onItemClick?.(item)}
                                aria-label={markerLabel}
                            >
                                <MapPin className="h-6 w-6 drop-shadow-md" />
                            </button>
                        </Tooltip>
                    );
                })}
            </div>

            {/* Location count */}
            <p className="text-xs text-muted-foreground text-center">
                {data.length} location{data.length !== 1 ? "s" : ""}
            </p>
        </div>
    );
}

DataMap.displayName = "DataMap";
