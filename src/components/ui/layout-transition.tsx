"use client";

import * as React from "react";
import { LayoutGroup, motion } from "@/lib/motion";
import { useMotion } from "@/hooks/use-motion";

export interface LayoutTransitionProps {
    children: React.ReactNode;
    /** Unique group ID to scope layout animations */
    id?: string;
    className?: string;
}

/**
 * LayoutTransition — wraps content in a LayoutGroup for FLIP-based
 * layout animations. Children with `layoutId` or `layout` props will
 * smoothly animate position/size changes (e.g., view mode switches,
 * filter changes, sort reorders).
 *
 * Usage:
 * ```tsx
 * <LayoutTransition id="projects-grid">
 *   {filteredItems.map(item => (
 *     <LayoutTransitionItem key={item.id} layoutId={item.id}>
 *       <ProjectCard {...item} />
 *     </LayoutTransitionItem>
 *   ))}
 * </LayoutTransition>
 * ```
 */
export function LayoutTransition({ children, id, className }: LayoutTransitionProps) {
    const { shouldAnimate } = useMotion();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <LayoutGroup id={id}>
            <div className={className}>{children}</div>
        </LayoutGroup>
    );
}

export interface LayoutTransitionItemProps {
    children: React.ReactNode;
    /** Unique layout ID for cross-render position tracking */
    layoutId?: string;
    /** Enable layout animation without a shared layoutId */
    layout?: boolean;
    className?: string;
}

export function LayoutTransitionItem({
    children,
    layoutId,
    layout = true,
    className,
}: LayoutTransitionItemProps) {
    const { shouldAnimate } = useMotion();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            layoutId={layoutId}
            layout={layoutId ? undefined : layout}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

LayoutTransition.displayName = "LayoutTransition";
LayoutTransitionItem.displayName = "LayoutTransitionItem";
