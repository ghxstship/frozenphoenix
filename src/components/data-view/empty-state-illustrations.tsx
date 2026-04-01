"use client";

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE ILLUSTRATIONS — View-specific SVG decorations

   Lightweight inline SVGs that mirror the structural layout of
   each data view. Uses semantic tokens (currentColor) for
   automatic dark-mode support. Each renders a ghosted preview
   of the view's characteristic layout so users intuitively
   understand what the view *would* look like with data.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps {
    className?: string | undefined;
}

// ─── Table: ghosted header + skeleton rows ──────────────────

export function EmptyTableIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 120"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Header row */}
            <rect x="8" y="8" width="184" height="16" rx="4" fill="currentColor" opacity="0.6" />
            {/* Divider */}
            <line
                x1="8"
                y1="30"
                x2="192"
                y2="30"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
            />
            {/* Row 1 */}
            <rect x="12" y="36" width="60" height="8" rx="3" fill="currentColor" />
            <rect x="82" y="36" width="40" height="8" rx="3" fill="currentColor" opacity="0.7" />
            <rect x="132" y="36" width="52" height="8" rx="3" fill="currentColor" opacity="0.5" />
            {/* Row 2 */}
            <rect x="12" y="54" width="48" height="8" rx="3" fill="currentColor" />
            <rect x="82" y="54" width="55" height="8" rx="3" fill="currentColor" opacity="0.7" />
            <rect x="132" y="54" width="36" height="8" rx="3" fill="currentColor" opacity="0.5" />
            {/* Row 3 */}
            <rect x="12" y="72" width="70" height="8" rx="3" fill="currentColor" />
            <rect x="82" y="72" width="30" height="8" rx="3" fill="currentColor" opacity="0.7" />
            <rect x="132" y="72" width="44" height="8" rx="3" fill="currentColor" opacity="0.5" />
            {/* Row 4 (faded) */}
            <rect x="12" y="90" width="55" height="8" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="82" y="90" width="45" height="8" rx="3" fill="currentColor" opacity="0.3" />
            <rect x="132" y="90" width="40" height="8" rx="3" fill="currentColor" opacity="0.2" />
            {/* Bottom fade */}
            <rect x="12" y="108" width="42" height="8" rx="3" fill="currentColor" opacity="0.15" />
            <rect x="82" y="108" width="36" height="8" rx="3" fill="currentColor" opacity="0.1" />
        </svg>
    );
}

// ─── Board: ghosted kanban columns ──────────────────────────

export function EmptyBoardIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 220 140"
            fill="none"
            className={cn(
                "w-52 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Column 1 */}
            <rect x="8" y="8" width="60" height="12" rx="4" fill="currentColor" opacity="0.6" />
            <rect
                x="8"
                y="26"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.5"
            />
            <rect
                x="8"
                y="64"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.3"
            />
            <rect
                x="8"
                y="102"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.15"
            />

            {/* Column 2 */}
            <rect x="80" y="8" width="60" height="12" rx="4" fill="currentColor" opacity="0.6" />
            <rect
                x="80"
                y="26"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.5"
            />
            <rect
                x="80"
                y="64"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.25"
            />

            {/* Column 3 */}
            <rect x="152" y="8" width="60" height="12" rx="4" fill="currentColor" opacity="0.6" />
            <rect
                x="152"
                y="26"
                width="60"
                height="32"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.4"
            />
        </svg>
    );
}

// ─── Cards: ghosted card grid ───────────────────────────────

export function EmptyCardsIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 140"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Card 1 */}
            <rect
                x="8"
                y="8"
                width="88"
                height="56"
                rx="8"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.6"
            />
            <rect x="16" y="16" width="40" height="6" rx="3" fill="currentColor" opacity="0.5" />
            <rect x="16" y="28" width="72" height="4" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="16" y="36" width="56" height="4" rx="2" fill="currentColor" opacity="0.2" />
            <rect x="16" y="48" width="24" height="8" rx="4" fill="currentColor" opacity="0.35" />

            {/* Card 2 */}
            <rect
                x="104"
                y="8"
                width="88"
                height="56"
                rx="8"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.45"
            />
            <rect x="112" y="16" width="48" height="6" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="112" y="28" width="64" height="4" rx="2" fill="currentColor" opacity="0.25" />
            <rect x="112" y="36" width="52" height="4" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="112" y="48" width="28" height="8" rx="4" fill="currentColor" opacity="0.25" />

            {/* Card 3 */}
            <rect
                x="8"
                y="72"
                width="88"
                height="56"
                rx="8"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.3"
            />
            <rect x="16" y="80" width="36" height="6" rx="3" fill="currentColor" opacity="0.25" />
            <rect x="16" y="92" width="68" height="4" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="16" y="100" width="44" height="4" rx="2" fill="currentColor" opacity="0.1" />

            {/* Card 4 (most faded) */}
            <rect
                x="104"
                y="72"
                width="88"
                height="56"
                rx="8"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.15"
            />
            <rect x="112" y="80" width="44" height="6" rx="3" fill="currentColor" opacity="0.12" />
            <rect x="112" y="92" width="60" height="4" rx="2" fill="currentColor" opacity="0.08" />
        </svg>
    );
}

// ─── Timeline: ghosted Gantt bars ───────────────────────────

export function EmptyTimelineIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 220 120"
            fill="none"
            className={cn(
                "w-52 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Time axis */}
            <line
                x1="60"
                y1="8"
                x2="60"
                y2="112"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
            />
            {/* Tick marks */}
            <line
                x1="100"
                y1="8"
                x2="100"
                y2="112"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.15"
                strokeDasharray="3 3"
            />
            <line
                x1="140"
                y1="8"
                x2="140"
                y2="112"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.15"
                strokeDasharray="3 3"
            />
            <line
                x1="180"
                y1="8"
                x2="180"
                y2="112"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.15"
                strokeDasharray="3 3"
            />

            {/* Row labels */}
            <rect x="8" y="22" width="44" height="6" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="8" y="50" width="36" height="6" rx="3" fill="currentColor" opacity="0.35" />
            <rect x="8" y="78" width="40" height="6" rx="3" fill="currentColor" opacity="0.25" />

            {/* Bar 1 */}
            <rect x="66" y="18" width="80" height="14" rx="4" fill="currentColor" opacity="0.5" />
            {/* Bar 2 */}
            <rect x="86" y="46" width="60" height="14" rx="4" fill="currentColor" opacity="0.35" />
            {/* Bar 3 */}
            <rect x="72" y="74" width="100" height="14" rx="4" fill="currentColor" opacity="0.2" />
            {/* Bar 4 (faded) */}
            <rect x="8" y="102" width="30" height="6" rx="3" fill="currentColor" opacity="0.12" />
            <rect x="90" y="100" width="50" height="10" rx="4" fill="currentColor" opacity="0.1" />
        </svg>
    );
}

// ─── Calendar: ghosted month grid ───────────────────────────

export function EmptyCalendarIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 140"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Weekday headers */}
            {["S", "M", "T", "W", "T", "F", "S"].map((_, i) => (
                <rect
                    key={i}
                    x={12 + i * 26}
                    y="8"
                    width="18"
                    height="8"
                    rx="2"
                    fill="currentColor"
                    opacity="0.5"
                />
            ))}
            {/* Horizontal divider */}
            <line
                x1="8"
                y1="22"
                x2="194"
                y2="22"
                stroke="currentColor"
                strokeWidth="0.75"
                opacity="0.3"
            />
            {/* Day cells — 5 rows × 7 cols */}
            {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 7 }).map((_, col) => {
                    const opacity = 0.4 - row * 0.06;
                    return (
                        <rect
                            key={`${row}-${col}`}
                            x={10 + col * 26}
                            y={28 + row * 22}
                            width="22"
                            height="18"
                            rx="3"
                            stroke="currentColor"
                            strokeWidth="0.75"
                            opacity={Math.max(0.08, opacity)}
                        />
                    );
                })
            )}
        </svg>
    );
}

// ─── Gallery: ghosted image grid ────────────────────────────

export function EmptyGalleryIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 130"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Image card 1 */}
            <rect
                x="8"
                y="8"
                width="88"
                height="52"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.5"
            />
            {/* Mountain icon */}
            <path d="M28 44 L40 28 L48 36 L56 24 L76 44 Z" fill="currentColor" opacity="0.2" />
            <circle cx="32" cy="24" r="4" fill="currentColor" opacity="0.25" />

            {/* Image card 2 */}
            <rect
                x="104"
                y="8"
                width="88"
                height="52"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.35"
            />
            <path
                d="M124 44 L136 28 L144 36 L152 24 L172 44 Z"
                fill="currentColor"
                opacity="0.15"
            />
            <circle cx="128" cy="24" r="4" fill="currentColor" opacity="0.18" />

            {/* Image card 3 */}
            <rect
                x="8"
                y="68"
                width="88"
                height="52"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.2"
            />
            <path d="M28 104 L40 88 L48 96 L56 84 L76 104 Z" fill="currentColor" opacity="0.1" />
            <circle cx="32" cy="84" r="4" fill="currentColor" opacity="0.12" />

            {/* Image card 4 (most faded) */}
            <rect
                x="104"
                y="68"
                width="88"
                height="52"
                rx="6"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.1"
            />
            <path
                d="M124 104 L136 88 L144 96 L152 84 L172 104 Z"
                fill="currentColor"
                opacity="0.06"
            />
        </svg>
    );
}

// ─── Chart: ghosted bar chart ───────────────────────────────

export function EmptyChartIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 120"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* X axis */}
            <line
                x1="30"
                y1="100"
                x2="190"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
            />
            {/* Y axis */}
            <line
                x1="30"
                y1="10"
                x2="30"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
            />
            {/* Grid lines */}
            <line
                x1="30"
                y1="30"
                x2="190"
                y2="30"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
                strokeDasharray="3 3"
            />
            <line
                x1="30"
                y1="55"
                x2="190"
                y2="55"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
                strokeDasharray="3 3"
            />
            <line
                x1="30"
                y1="78"
                x2="190"
                y2="78"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
                strokeDasharray="3 3"
            />
            {/* Bars */}
            <rect x="46" y="40" width="24" height="60" rx="4" fill="currentColor" opacity="0.5" />
            <rect x="82" y="58" width="24" height="42" rx="4" fill="currentColor" opacity="0.4" />
            <rect x="118" y="24" width="24" height="76" rx="4" fill="currentColor" opacity="0.3" />
            <rect x="154" y="68" width="24" height="32" rx="4" fill="currentColor" opacity="0.2" />
        </svg>
    );
}

// ─── Map: ghosted pin/grid ──────────────────────────────────

export function EmptyMapIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 130"
            fill="none"
            className={cn(
                "w-48 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Background grid */}
            {Array.from({ length: 5 }).map((_, i) => (
                <line
                    key={`h${i}`}
                    x1="8"
                    y1={12 + i * 26}
                    x2="192"
                    y2={12 + i * 26}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.15"
                />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
                <line
                    key={`v${i}`}
                    x1={12 + i * 28}
                    y1="8"
                    x2={12 + i * 28}
                    y2="122"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.15"
                />
            ))}
            {/* Region outline */}
            <circle
                cx="100"
                cy="65"
                r="40"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.25"
            />
            {/* Pin markers */}
            <path
                d="M80 55 C80 47 88 42 88 42 C88 42 96 47 96 55 C96 63 88 72 88 72 C88 72 80 63 80 55Z"
                fill="currentColor"
                opacity="0.4"
            />
            <circle cx="88" cy="54" r="3" fill="currentColor" opacity="0.15" />
            <path
                d="M112 70 C112 62 120 57 120 57 C120 57 128 62 128 70 C128 78 120 87 120 87 C120 87 112 78 112 70Z"
                fill="currentColor"
                opacity="0.25"
            />
            <circle cx="120" cy="69" r="3" fill="currentColor" opacity="0.1" />
            <path
                d="M96 38 C96 30 104 25 104 25 C104 25 112 30 112 38 C112 46 104 55 104 55 C104 55 96 46 96 38Z"
                fill="currentColor"
                opacity="0.15"
            />
        </svg>
    );
}

// ─── Workload: ghosted capacity bars ────────────────────────

export function EmptyWorkloadIllustration({ className }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 220 120"
            fill="none"
            className={cn(
                "w-52 h-auto text-muted-foreground/15 motion-safe:animate-fade-in",
                className
            )}
            aria-hidden="true"
        >
            {/* Header */}
            <rect x="8" y="8" width="40" height="8" rx="3" fill="currentColor" opacity="0.5" />
            <rect x="60" y="8" width="36" height="8" rx="3" fill="currentColor" opacity="0.35" />
            <rect x="106" y="8" width="36" height="8" rx="3" fill="currentColor" opacity="0.35" />
            <rect x="152" y="8" width="36" height="8" rx="3" fill="currentColor" opacity="0.35" />
            <line
                x1="8"
                y1="22"
                x2="212"
                y2="22"
                stroke="currentColor"
                strokeWidth="0.75"
                opacity="0.3"
            />

            {/* Resource row 1 */}
            <circle cx="20" cy="38" r="8" fill="currentColor" opacity="0.3" />
            <rect x="34" y="34" width="20" height="6" rx="3" fill="currentColor" opacity="0.35" />
            {/* Capacity bars */}
            <rect x="60" y="30" width="36" height="14" rx="3" fill="currentColor" opacity="0.1" />
            <rect x="60" y="30" width="28" height="14" rx="3" fill="currentColor" opacity="0.35" />
            <rect x="106" y="30" width="36" height="14" rx="3" fill="currentColor" opacity="0.1" />
            <rect x="106" y="30" width="20" height="14" rx="3" fill="currentColor" opacity="0.3" />
            <rect x="152" y="30" width="36" height="14" rx="3" fill="currentColor" opacity="0.1" />
            <rect x="152" y="30" width="32" height="14" rx="3" fill="currentColor" opacity="0.25" />

            {/* Resource row 2 */}
            <circle cx="20" cy="64" r="8" fill="currentColor" opacity="0.2" />
            <rect x="34" y="60" width="18" height="6" rx="3" fill="currentColor" opacity="0.25" />
            <rect x="60" y="56" width="36" height="14" rx="3" fill="currentColor" opacity="0.08" />
            <rect x="60" y="56" width="18" height="14" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="106" y="56" width="36" height="14" rx="3" fill="currentColor" opacity="0.08" />
            <rect x="106" y="56" width="30" height="14" rx="3" fill="currentColor" opacity="0.18" />
            <rect x="152" y="56" width="36" height="14" rx="3" fill="currentColor" opacity="0.08" />
            <rect x="152" y="56" width="14" height="14" rx="3" fill="currentColor" opacity="0.12" />

            {/* Resource row 3 (faded) */}
            <circle cx="20" cy="90" r="8" fill="currentColor" opacity="0.1" />
            <rect x="34" y="86" width="22" height="6" rx="3" fill="currentColor" opacity="0.12" />
            <rect x="60" y="82" width="36" height="14" rx="3" fill="currentColor" opacity="0.05" />
            <rect x="60" y="82" width="24" height="14" rx="3" fill="currentColor" opacity="0.1" />
            <rect x="106" y="82" width="36" height="14" rx="3" fill="currentColor" opacity="0.05" />
            <rect x="152" y="82" width="36" height="14" rx="3" fill="currentColor" opacity="0.05" />
        </svg>
    );
}
