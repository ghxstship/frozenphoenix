"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Skip Link Component (WCAG 2.4.1)
 *
 * Allows keyboard users to bypass repetitive navigation
 * and jump directly to main content or other landmarks.
 *
 * Visible only when focused via keyboard navigation.
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
    return (
        <a
            href={href}
            className={cn(
                "sr-only focus:not-sr-only",
                "focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-skip-link)]",
                "focus:px-4 focus:py-2",
                "focus:bg-primary focus:text-primary-foreground",
                "focus:rounded-md focus:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "font-medium text-sm",
                "motion-reduce:transition-none",
                className
            )}
        >
            {children}
        </a>
    );
}

/**
 * Skip Links Container
 *
 * Standard skip links for main navigation patterns.
 * Place at the very top of your layout.
 */
export function SkipLinks() {
    return (
        <div className="skip-links">
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <SkipLink href="#main-navigation">Skip to navigation</SkipLink>
        </div>
    );
}
