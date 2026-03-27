"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/use-media-query";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "@/lib/motion";
import { SPRING_PRESETS } from "@/config/design-tokens";

// ── Quick Create Actions (context-aware) ──

interface FabAction {
    label: string;
    href: string;
    /** Pathname prefixes where this action is relevant */
    contexts: string[];
}

const FAB_ACTIONS: FabAction[] = [
    {
        label: "New Event",
        href: "/events?action=create",
        contexts: ["/events", "/dashboard", "/calendar"],
    },
    {
        label: "New Task",
        href: "/tasks?action=create",
        contexts: ["/tasks", "/home/tasks", "/dashboard", "/projects"],
    },
    {
        label: "New Project",
        href: "/projects?action=create",
        contexts: ["/projects", "/dashboard"],
    },
    {
        label: "New Invoice",
        href: "/invoices?action=create",
        contexts: ["/invoices", "/finance", "/billing"],
    },
    {
        label: "New Crew",
        href: "/crew?action=create",
        contexts: ["/crew", "/workforce", "/shifts"],
    },
    {
        label: "New Vendor",
        href: "/vendors?action=create",
        contexts: ["/vendors", "/vendor-onboarding"],
    },
];

// ── Component ──

export function MobileFab({ className }: { className?: string }) {
    const pathname = usePathname();
    const { isDesktop } = useBreakpoint();
    const [isOpen, setIsOpen] = useState(false);
    const lastScrollY = useRef(0);
    const [isVisible, setIsVisible] = useState(true);

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        if (isDesktop) return;
        const handleScroll = () => {
            const currentY = window.scrollY;
            setIsVisible(currentY < lastScrollY.current || currentY < 100);
            lastScrollY.current = currentY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isDesktop]);

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Don't render on desktop
    if (isDesktop) return null;

    // Filter actions relevant to current page
    const relevantActions = FAB_ACTIONS.filter((action) =>
        action.contexts.some((ctx) => pathname.startsWith(ctx))
    );

    // Fallback: show first 3 generic actions if no context match
    const actions = relevantActions.length > 0 ? relevantActions : FAB_ACTIONS.slice(0, 3);

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
                        onClick={handleClose}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Action Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", ...SPRING_PRESETS.bouncy }}
                        className="fixed right-4 z-50 flex flex-col gap-2 lg:hidden"
                        style={{ bottom: "calc(140px + env(safe-area-inset-bottom, 0px))" }}
                    >
                        {actions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                onClick={handleClose}
                                className="flex items-center justify-end gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-medium shadow-lg border border-border hover:bg-accent transition-colors"
                            >
                                {action.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
                type="button"
                onClick={handleToggle}
                animate={{
                    y: isVisible ? 0 : 100,
                    rotate: isOpen ? 45 : 0,
                }}
                transition={{
                    type: "spring",
                    ...SPRING_PRESETS.bouncy,
                }}
                className={cn(
                    "fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors lg:hidden",
                    isOpen
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    className
                )}
                style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
                aria-label={isOpen ? "Close quick actions" : "Quick create"}
                aria-expanded={isOpen}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </motion.button>
        </>
    );
}
