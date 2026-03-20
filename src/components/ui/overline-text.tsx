"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OverlineTextProps {
    children: React.ReactNode;
    as?: "p" | "span" | "h3" | "h4" | "div";
    visualCaps?: boolean;
    className?: string;
}

/**
 * OverlineText — Renders small metadata/section labels with consistent typography.
 *
 * When `visualCaps` is true (default), text is visually uppercased via CSS but
 * retains its original casing in the DOM for screen-reader compatibility.
 * An `aria-label` with the original-case string is set automatically so that
 * assistive technology reads natural language instead of spelling out letters.
 */
export function OverlineText({
    children,
    as: Tag = "p",
    visualCaps = true,
    className,
}: OverlineTextProps) {
    const ariaLabel = visualCaps && typeof children === "string" ? children : undefined;

    return (
        <Tag
            className={cn(
                "density-caption font-semibold tracking-wide text-muted-foreground",
                visualCaps && "uppercase",
                className
            )}
            aria-label={ariaLabel}
        >
            {children}
        </Tag>
    );
}
