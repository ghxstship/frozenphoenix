"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Responsive Container
 * 
 * Provides consistent padding and max-width across breakpoints.
 * Uses logical properties for RTL support.
 */
export function ResponsiveContainer({
    children,
    className,
}: ResponsiveContainerProps) {
    return (
        <div
            className={cn(
                "w-full mx-auto",
                "px-4 sm:px-6 lg:px-8",
                "max-w-[1400px]",
                className
            )}
        >
            {children}
        </div>
    );
}

interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: "sm" | "md" | "lg";
}

/**
 * Responsive Grid
 * 
 * Provides a responsive CSS grid with configurable columns per breakpoint.
 */
export function ResponsiveGrid({
    children,
    className,
    cols = { default: 1, sm: 1, md: 2, lg: 3 },
    gap = "md",
}: ResponsiveGridProps) {
    const gapClasses = {
        sm: "gap-2 sm:gap-3",
        md: "gap-3 sm:gap-4 lg:gap-6",
        lg: "gap-4 sm:gap-6 lg:gap-8",
    };

    const colClasses = [
        cols.default === 1 ? "grid-cols-1" : `grid-cols-${cols.default}`,
        cols.sm ? `sm:grid-cols-${cols.sm}` : "",
        cols.md ? `md:grid-cols-${cols.md}` : "",
        cols.lg ? `lg:grid-cols-${cols.lg}` : "",
        cols.xl ? `xl:grid-cols-${cols.xl}` : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={cn("grid", colClasses, gapClasses[gap], className)}>
            {children}
        </div>
    );
}

interface ResponsiveStackProps {
    children: React.ReactNode;
    className?: string;
    direction?: "row" | "col";
    reverseOnMobile?: boolean;
    gap?: "sm" | "md" | "lg";
}

/**
 * Responsive Stack
 * 
 * Flexbox container that stacks vertically on mobile and horizontally on desktop.
 */
export function ResponsiveStack({
    children,
    className,
    direction = "row",
    reverseOnMobile = false,
    gap = "md",
}: ResponsiveStackProps) {
    const gapClasses = {
        sm: "gap-2 sm:gap-3",
        md: "gap-3 sm:gap-4",
        lg: "gap-4 sm:gap-6",
    };

    return (
        <div
            className={cn(
                "flex",
                direction === "row"
                    ? reverseOnMobile
                        ? "flex-col-reverse sm:flex-row"
                        : "flex-col sm:flex-row"
                    : reverseOnMobile
                        ? "flex-row sm:flex-col"
                        : "flex-col",
                gapClasses[gap],
                className
            )}
        >
            {children}
        </div>
    );
}

interface HideOnProps {
    children: React.ReactNode;
    breakpoint: "xs" | "sm" | "md" | "lg" | "xl";
    above?: boolean;
}

/**
 * Hide On Breakpoint
 * 
 * Conditionally hides content at specific breakpoints.
 */
export function HideOn({ children, breakpoint, above = false }: HideOnProps) {
    const hideClasses = {
        xs: above ? "sm:hidden" : "hidden sm:block",
        sm: above ? "md:hidden" : "hidden md:block",
        md: above ? "lg:hidden" : "hidden lg:block",
        lg: above ? "xl:hidden" : "hidden xl:block",
        xl: above ? "2xl:hidden" : "hidden 2xl:block",
    };

    return <div className={hideClasses[breakpoint]}>{children}</div>;
}

/**
 * Show On Breakpoint
 * 
 * Conditionally shows content at specific breakpoints.
 */
export function ShowOn({ children, breakpoint, above = false }: HideOnProps) {
    const showClasses = {
        xs: above ? "hidden sm:block" : "block sm:hidden",
        sm: above ? "hidden md:block" : "block md:hidden",
        md: above ? "hidden lg:block" : "block lg:hidden",
        lg: above ? "hidden xl:block" : "block xl:hidden",
        xl: above ? "hidden 2xl:block" : "block 2xl:hidden",
    };

    return <div className={showClasses[breakpoint]}>{children}</div>;
}
