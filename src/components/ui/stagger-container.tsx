"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { STAGGER_SCALE, type StaggerScaleToken } from "@/config/design-tokens";

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    stagger?: StaggerScaleToken;
    animation?: "slide-up" | "fade-in" | "scale-in";
}

export function StaggerContainer({
    stagger = "normal",
    animation = "slide-up",
    className,
    children,
    ...props
}: StaggerContainerProps) {
    const delay = STAGGER_SCALE[stagger];
    const animClass =
        animation === "slide-up"
            ? "animate-slide-up"
            : animation === "fade-in"
              ? "animate-fade-in"
              : "animate-scale-in";

    return (
        <div className={className} {...props}>
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;
                return (
                    <div
                        className={animClass}
                        style={{ animationDelay: `${index * delay}ms` }}
                        key={child.key ?? index}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    );
}

export interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
    index: number;
    stagger?: StaggerScaleToken;
    animation?: "slide-up" | "fade-in" | "scale-in";
}

export function StaggerItem({
    index,
    stagger = "normal",
    animation = "slide-up",
    className,
    children,
    ...props
}: StaggerItemProps) {
    const delay = STAGGER_SCALE[stagger];
    const animClass =
        animation === "slide-up"
            ? "animate-slide-up"
            : animation === "fade-in"
              ? "animate-fade-in"
              : "animate-scale-in";

    return (
        <div
            className={cn(animClass, className)}
            style={{ animationDelay: `${index * delay}ms` }}
            {...props}
        >
            {children}
        </div>
    );
}
