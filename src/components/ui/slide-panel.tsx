"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "@/lib/motion";
import { SPRING_PRESETS } from "@/config/design-tokens";
import { X } from "lucide-react";

interface SlidePanelProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    side?: "right" | "left";
    width?: string;
    children: React.ReactNode;
    className?: string;
}

export function SlidePanel({
    open,
    onClose,
    title,
    side = "right",
    width = "max-w-md",
    children,
    className,
}: SlidePanelProps) {
    React.useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    const slideX = side === "right" ? "100%" : "-100%";

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        className={cn(
                            "fixed top-0 bottom-0 z-[101] w-full bg-background border-border shadow-2xl flex flex-col",
                            side === "right" ? "right-0 border-l" : "left-0 border-r",
                            width,
                            className
                        )}
                        initial={{ x: slideX }}
                        animate={{ x: 0 }}
                        exit={{ x: slideX }}
                        transition={{ type: "spring", ...SPRING_PRESETS.gentle }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title ?? "Panel"}
                    >
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                                <h2 className="text-base font-semibold">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    aria-label="Close panel"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-6">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
