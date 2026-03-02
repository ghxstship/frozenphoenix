"use client";

import * as React from "react";
import { Badge, type BadgeProps } from "./badge";
import {
    type BadgeVariant,
    getConditionLabel,
    getConditionVariant,
    getPriorityLabel,
    getPriorityVariant,
    getStatusLabel,
    getStatusVariant,
} from "@/config/ui-variants";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
    status: string;
    showLabel?: boolean;
    customLabel?: string;
}

interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
    priority: string;
    showLabel?: boolean;
    customLabel?: string;
}

interface ConditionBadgeProps extends Omit<BadgeProps, "variant"> {
    condition: string;
    showLabel?: boolean;
    customLabel?: string;
}

interface GenericBadgeProps extends Omit<BadgeProps, "variant"> {
    value: string;
    variant?: BadgeVariant;
    label?: string;
}

/**
 * StatusBadge — Renders a badge with automatic variant based on status value
 * Uses SSOT variant mappings from @/config/ui-variants
 */
export function StatusBadge({
    status,
    showLabel = true,
    customLabel,
    children,
    ...props
}: StatusBadgeProps) {
    const variant = getStatusVariant(status);
    const label = customLabel ?? getStatusLabel(status);

    return (
        <Badge variant={variant} {...props}>
            {children ?? (showLabel ? label : status)}
        </Badge>
    );
}

/**
 * PriorityBadge — Renders a badge with automatic variant based on priority value
 */
export function PriorityBadge({
    priority,
    showLabel = true,
    customLabel,
    children,
    ...props
}: PriorityBadgeProps) {
    const variant = getPriorityVariant(priority);
    const label = customLabel ?? getPriorityLabel(priority);

    return (
        <Badge variant={variant} {...props}>
            {children ?? (showLabel ? label : priority)}
        </Badge>
    );
}

/**
 * ConditionBadge — Renders a badge with automatic variant based on condition value
 */
export function ConditionBadge({
    condition,
    showLabel = true,
    customLabel,
    children,
    ...props
}: ConditionBadgeProps) {
    const variant = getConditionVariant(condition);
    const label = customLabel ?? getConditionLabel(condition);

    return (
        <Badge variant={variant} {...props}>
            {children ?? (showLabel ? label : condition)}
        </Badge>
    );
}

/**
 * GenericBadge — Renders a badge with explicit variant and label
 * Use when you need full control or for non-standard values
 */
export function GenericBadge({
    value,
    variant = "ghost",
    label,
    children,
    ...props
}: GenericBadgeProps) {
    return (
        <Badge variant={variant} {...props}>
            {children ?? label ?? value}
        </Badge>
    );
}
