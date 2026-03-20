import * as React from "react";
import { cn } from "@/lib/utils";

type IconContainerVariant = "default" | "success" | "warning" | "danger" | "info";

const VARIANT_STYLES: Record<IconContainerVariant, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
};

interface IconContainerProps {
    icon: React.ComponentType<{ className?: string }>;
    variant?: IconContainerVariant;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_STYLES = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
} as const;

const ICON_SIZE_STYLES = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
} as const;

export function IconContainer({
    icon: Icon,
    variant = "default",
    size = "md",
    className,
}: IconContainerProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center",
                SIZE_STYLES[size],
                VARIANT_STYLES[variant],
                className
            )}
        >
            <Icon className={ICON_SIZE_STYLES[size]} />
        </div>
    );
}
