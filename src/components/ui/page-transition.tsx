"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string | undefined;
}

/**
 * Performance: CSS-only page transition — removes motion/react (~18KB) from
 * the critical rendering path. Uses existing animate-slide-up keyframe from
 * globals.css. No exit animation (AnimatePresence mode="wait" added 150ms
 * delay to every navigation for an effect users don't perceive).
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <div key={pathname} className={cn("animate-slide-up", className)}>
            {children}
        </div>
    );
}
