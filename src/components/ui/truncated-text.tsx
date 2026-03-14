"use client";

/* ═══════════════════════════════════════════════════════════════
   TRUNCATED TEXT — Shows full text in a tooltip when truncated
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface TruncatedTextProps {
    children: string;
    className?: string;
    /** Maximum number of CSS lines before truncating (default: 1) */
    maxLines?: 1 | 2 | 3;
    /** Tooltip placement side (default: "top") */
    side?: "top" | "bottom" | "left" | "right";
    /** HTML element to render (default: "span") */
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
}

const LINE_CLAMP: Record<number, string> = {
    1: "truncate",
    2: "line-clamp-2",
    3: "line-clamp-3",
};

/**
 * Renders text with CSS truncation and automatically shows a Tooltip
 * containing the full text when the element is actually overflowing.
 *
 * Uses a ResizeObserver to detect overflow so the tooltip only appears
 * when the text is genuinely clipped.
 */
export function TruncatedText({
    children,
    className,
    maxLines = 1,
    side = "top",
    as: Tag = "span",
}: TruncatedTextProps) {
    const ref = React.useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const check = () => {
            if (maxLines === 1) {
                setIsTruncated(el.scrollWidth > el.clientWidth);
            } else {
                setIsTruncated(el.scrollHeight > el.clientHeight);
            }
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, [children, maxLines]);

    const inner = (
        <Tag ref={ref as React.RefObject<never>} className={cn(LINE_CLAMP[maxLines], className)}>
            {children}
        </Tag>
    );

    if (!isTruncated) return inner;

    return (
        <Tooltip content={children} side={side}>
            {inner}
        </Tooltip>
    );
}

TruncatedText.displayName = "TruncatedText";
