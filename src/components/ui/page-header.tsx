import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    /** Optional hero icon rendered above the title (useful for standalone/onboarding pages) */
    icon?: LucideIcon;
    /** Icon container className override */
    iconClassName?: string;
    /** When true, centers title/description/icon (for standalone flows like onboarding) */
    centered?: boolean;
}

export function PageHeader({
    title,
    description,
    children,
    className,
    icon: Icon,
    iconClassName,
    centered,
}: PageHeaderProps) {
    if (centered) {
        return (
            <div className={cn("text-center space-y-2", className)}>
                {Icon && (
                    <div
                        className={cn(
                            "inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2",
                            iconClassName
                        )}
                    >
                        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
                )}
                {children && (
                    <div className="flex items-center justify-center gap-2 mt-3">{children}</div>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-6",
                className
            )}
        >
            <div className="flex items-start gap-3">
                {Icon && (
                    <div
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10",
                            iconClassName
                        )}
                    >
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </div>
            {children && <div className="flex items-center gap-2 mt-3 sm:mt-0">{children}</div>}
        </div>
    );
}
