import * as React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeSuffix?: string;
    icon?: LucideIcon;
    description?: string;
    className?: string;
}

export function StatCard({ title, value, change, changeSuffix = "%", icon: Icon, description, className }: StatCardProps) {
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
        <div className={cn("spatial-card p-5 animate-fade-in", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
                {Icon && (
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                )}
            </div>
            {(change !== undefined || description) && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                    {change !== undefined && (
                        <span className={cn("flex items-center gap-0.5 font-medium",
                            isPositive && "text-success",
                            isNegative && "text-destructive",
                            !isPositive && !isNegative && "text-muted-foreground"
                        )}>
                            <TrendIcon className="h-3 w-3" />
                            {Math.abs(change)}{changeSuffix}
                        </span>
                    )}
                    {description && <span className="text-muted-foreground">{description}</span>}
                </div>
            )}
        </div>
    );
}
