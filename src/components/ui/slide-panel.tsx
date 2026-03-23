"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "@/lib/motion";
import { SPRING_PRESETS } from "@/config/design-tokens";
import { useFocusTrap } from "@/hooks/use-accessibility";
import { Tooltip } from "@/components/ui/tooltip";
import { X } from "lucide-react";

interface SlidePanelProps {
    open: boolean;
    onClose: () => void;
    title?: string | undefined;
    side?: "right" | "left" | undefined;
    width?: string | undefined;
    children: React.ReactNode;
    className?: string | undefined;
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
    const focusTrapRef = useFocusTrap(open);

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
                        className="fixed inset-0 z-[var(--z-overlay)] glass-overlay backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={focusTrapRef as React.Ref<HTMLDivElement>}
                        className={cn(
                            "fixed top-0 bottom-0 z-[var(--z-panel)] w-full flex flex-col",
                            "bg-[var(--glass-surface-bg)] backdrop-blur-xl backdrop-saturate-150",
                            "border-[var(--glass-surface-border)] glass-noise glass-edge-glow",
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
                                <Tooltip content="Close panel" side="bottom">
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                        aria-label="Close panel"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-6">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
