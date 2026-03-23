/**
 * StatCard — Backward-compatible wrapper around MetricCard.
 *
 * All new code should prefer MetricCard directly for access to
 * variant theming, thresholds, sparkline, and unit support.
 */

import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number | undefined;
    changeSuffix?: string | undefined;
    icon?: LucideIcon | undefined;
    description?: string | undefined;
    className?: string | undefined;
}

export function StatCard({
    title,
    value,
    change,
    changeSuffix,
    icon,
    description,
    className,
}: StatCardProps) {
    return (
        <MetricCard
            label={title}
            value={value}
            change={change}
            changeSuffix={changeSuffix}
            icon={icon}
            description={description}
            className={className}
        />
    );
}
