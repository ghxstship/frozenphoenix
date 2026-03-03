"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "@/lib/motion";
import { useMotion } from "@/hooks/use-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    const pathname = usePathname();
    const { shouldAnimate } = useMotion();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
