"use client";

import { OverlineText } from "@/components/ui/overline-text";
import { AlertTriangle, Calendar, Clock, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export interface TimeHorizonGroupProps {
    label: string;
    variant: "overdue" | "today" | "this-week" | "later";
    count: number;
    children: ReactNode;
}

const VARIANT_CONFIG: Record<
    TimeHorizonGroupProps["variant"],
    { icon: React.ElementType; className: string }
> = {
    overdue: { icon: AlertTriangle, className: "text-destructive" },
    today: { icon: Clock, className: "text-warning" },
    "this-week": { icon: Calendar, className: "text-info" },
    later: { icon: Inbox, className: "text-muted-foreground" },
};

export function TimeHorizonGroup({ label, variant, count, children }: TimeHorizonGroupProps) {
    const cfg = VARIANT_CONFIG[variant];
    const Icon = cfg.icon;

    if (count === 0) return null;

    return (
        <div className="space-y-1">
            <OverlineText as="h3" className={`flex items-center gap-1.5 ${cfg.className}`}>
                <Icon className="h-3 w-3" />
                {label}
                <span className="text-[10px] font-normal ml-1">({count})</span>
            </OverlineText>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}
