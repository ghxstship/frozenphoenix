"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ENTITY_RELATIONSHIP_MAP } from "@/config/production-config";
import type { EntityType } from "@/types/production";

interface EntityLinkProps {
    entityType: EntityType;
    entityId: string;
    entityName: string;
    status?: string | undefined;
    showIcon?: boolean | undefined;
    showType?: boolean | undefined;
    size?: "sm" | "md" | "lg" | undefined;
    className?: string | undefined;
}

export function EntityLink({
    entityType,
    entityId,
    entityName,
    status,
    showIcon = true,
    showType = false,
    size = "md",
    className,
}: EntityLinkProps) {
    const config = ENTITY_RELATIONSHIP_MAP[entityType];
    if (!config) return <span className={className}>{entityName}</span>;

    const Icon = config.icon;
    const href = `${config.path}/${entityId}`;

    const sizeClasses = {
        sm: "text-xs gap-1",
        md: "text-sm gap-1.5",
        lg: "text-base gap-2",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center text-primary hover:underline transition-colors",
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <Icon className={cn(iconSizes[size], "shrink-0")} />}
            <span className="truncate">
                {showType && <span className="text-muted-foreground">{config.label}: </span>}
                {entityName}
            </span>
            {status && (
                <span className="density-caption text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                    {status}
                </span>
            )}
        </Link>
    );
}
