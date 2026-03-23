"use client";

import * as React from "react";
import { AnimatePresence, motion } from "@/lib/motion";
import { useMotion } from "@/hooks/use-motion";

export interface AnimatedListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    children: React.ReactNode;
    /** Layout animation for reorder smoothing */
    layout?: boolean | undefined;
}

/**
 * AnimatedList — wraps list items with AnimatePresence for enter/exit
 * animations. Each direct child MUST have a unique `key`.
 *
 * Usage:
 * ```tsx
 * <AnimatedList>
 *   {items.map(item => (
 *     <AnimatedListItem key={item.id}>
 *       <MyCard {...item} />
 *     </AnimatedListItem>
 *   ))}
 * </AnimatedList>
 * ```
 */
export function AnimatedList({ children, className, layout: _layout, ...rest }: AnimatedListProps) {
    const { shouldAnimate } = useMotion();

    if (!shouldAnimate) {
        return (
            <div className={className} {...rest}>
                {children}
            </div>
        );
    }

    return (
        <div className={className} {...rest}>
            <AnimatePresence mode="popLayout" initial={false}>
                {children}
            </AnimatePresence>
        </div>
    );
}

export interface AnimatedListItemProps {
    children: React.ReactNode;
    className?: string | undefined; /** Enable layout animation for reorder smoothing */
    layout?: boolean | undefined;
}

export function AnimatedListItem({ children, className, layout = true }: AnimatedListItemProps) {
    const { shouldAnimate } = useMotion();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            layout={layout}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

AnimatedList.displayName = "AnimatedList";
AnimatedListItem.displayName = "AnimatedListItem";
