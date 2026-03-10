"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const chipVariants = cva(
    "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-secondary text-secondary-foreground",
                primary: "bg-primary/10 text-primary",
                success: "bg-success/10 text-success",
                warning: "bg-warning/10 text-warning",
                destructive: "bg-destructive/10 text-destructive",
                info: "bg-info/10 text-info",
                outline: "border border-border text-foreground",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px]",
                md: "px-2.5 py-0.5 text-xs",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: { variant: "default", size: "md" },
    }
);

export interface ChipProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof chipVariants> {
    onRemove?: () => void;
    icon?: React.ReactNode;
}

export function Chip({
    className,
    variant,
    size,
    onRemove,
    icon,
    children,
    ...props
}: ChipProps) {
    return (
        <span className={cn(chipVariants({ variant, size }), className)} {...props}>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label={`Remove ${children}`}
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            )}
        </span>
    );
}

export { chipVariants };
