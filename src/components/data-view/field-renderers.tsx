"use client";

/* ═══════════════════════════════════════════════════════════════
   FIELD RENDERERS — ClickUp-Style Field Type Components
   ═══════════════════════════════════════════════════════════════
   
   Renders data fields based on their type with consistent styling:
   - Status/Priority badges with color coding
   - Progress bars with percentage
   - Currency formatting
   - Date/relative time display
   - User avatars with names
   - Rating stars
   - Boolean checkmarks
   - Tags/labels
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import {
    Star,
    StarHalf,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Circle,
    ArrowUp,
    ArrowDown,
    Minus,
    Percent,
    Link as LinkIcon,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
} from "lucide-react";
import type { BadgeVariant } from "@/config/ui-variants";

// ─── Field Type Definitions ───
export type FieldType =
    | "text"
    | "number"
    | "currency"
    | "percentage"
    | "date"
    | "datetime"
    | "relative_time"
    | "status"
    | "priority"
    | "progress"
    | "user"
    | "users"
    | "boolean"
    | "rating"
    | "tags"
    | "email"
    | "phone"
    | "url"
    | "location"
    | "file"
    | "custom";

export interface FieldConfig {
    type: FieldType;
    label?: string;
    // For status/priority fields
    variantMap?: Record<string, BadgeVariant>;
    labelMap?: Record<string, string>;
    // For progress fields
    showPercentage?: boolean;
    colorThresholds?: { value: number; color: string }[];
    // For user fields
    showAvatar?: boolean;
    showName?: boolean;
    // For date fields
    format?: string;
    // For custom rendering
    render?: (value: unknown) => React.ReactNode;
}

// ─── Status Field ───
interface StatusFieldProps {
    value: string;
    variantMap?: Record<string, BadgeVariant>;
    labelMap?: Record<string, string>;
    size?: "sm" | "md";
}

export function StatusField({ value, variantMap, labelMap, size = "sm" }: StatusFieldProps) {
    const variant = variantMap?.[value] ?? "ghost";
    const explicit = labelMap?.[value];
    if (!explicit && process.env.NODE_ENV === "development") {
        console.warn(`[casing] StatusField missing labelMap entry for "${value}". Pass an explicit labelMap.`);
    }
    const label = explicit ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <Badge variant={variant} className={cn(size === "sm" && "text-xs px-2 py-0.5")}>
            {label}
        </Badge>
    );
}

// ─── Priority Field ───
interface PriorityFieldProps {
    value: string;
    showIcon?: boolean;
    size?: "sm" | "md";
}

const priorityConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    critical: { icon: AlertTriangle, color: "text-destructive", label: "Critical" },
    high: { icon: ArrowUp, color: "text-warning", label: "High" },
    medium: { icon: Minus, color: "text-info", label: "Medium" },
    low: { icon: ArrowDown, color: "text-success", label: "Low" },
};

export function PriorityField({ value, showIcon = true, size = "sm" }: PriorityFieldProps) {
    const config = priorityConfig[value] ?? { icon: Circle, color: "text-muted-foreground", label: value };
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1.5", size === "sm" ? "text-xs" : "text-sm")}>
            {showIcon && <Icon className={cn("h-3.5 w-3.5", config.color)} />}
            <span className={config.color}>{config.label}</span>
        </div>
    );
}

// ─── Progress Field ───
interface ProgressFieldProps {
    value: number;
    max?: number;
    showPercentage?: boolean;
    size?: "sm" | "md" | "lg";
    colorThresholds?: { value: number; color: string }[];
}

export function ProgressField({
    value,
    max = 100,
    showPercentage = true,
    size = "sm",
    colorThresholds,
}: ProgressFieldProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const getColor = () => {
        if (colorThresholds) {
            for (const threshold of colorThresholds.sort((a, b) => b.value - a.value)) {
                if (percentage >= threshold.value) return threshold.color;
            }
        }
        if (percentage >= 100) return "bg-success";
        if (percentage >= 75) return "bg-info";
        if (percentage >= 50) return "bg-warning";
        if (percentage >= 25) return "bg-warning";
        return "bg-destructive";
    };

    const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <div className={cn("flex-1 bg-secondary rounded-full overflow-hidden", heights[size])}>
                <div
                    className={cn("h-full rounded-full transition-all duration-300", getColor())}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showPercentage && (
                <span className="text-xs text-muted-foreground font-medium w-10 text-right">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}

// ─── Currency Field ───
interface CurrencyFieldProps {
    value: number;
    currency?: string;
    showSign?: boolean;
    compact?: boolean;
    className?: string;
}

export function CurrencyField({
    value,
    currency = "USD",
    showSign = false,
    compact = false,
    className,
}: CurrencyFieldProps) {
    const formatted = compact
        ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
              notation: "compact",
              maximumFractionDigits: 1,
          }).format(value)
        : formatCurrency(value);

    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
        <span
            className={cn(
                "font-medium tabular-nums",
                showSign && isPositive && "text-success",
                showSign && isNegative && "text-destructive",
                className
            )}
        >
            {showSign && isPositive && "+"}
            {formatted}
        </span>
    );
}

// ─── Percentage Field ───
interface PercentageFieldProps {
    value: number;
    showIcon?: boolean;
    colorCoded?: boolean;
    className?: string;
}

export function PercentageField({ value, showIcon = false, colorCoded = false, className }: PercentageFieldProps) {
    const getColor = () => {
        if (!colorCoded) return "";
        if (value >= 75) return "text-success";
        if (value >= 50) return "text-warning";
        if (value >= 25) return "text-warning";
        return "text-destructive";
    };

    return (
        <span className={cn("flex items-center gap-1 font-medium tabular-nums", getColor(), className)}>
            {showIcon && <Percent className="h-3 w-3" />}
            {value}%
        </span>
    );
}

// ─── Date Field ───
interface DateFieldProps {
    value: string | Date | null | undefined;
    format?: "short" | "medium" | "long" | "relative";
    showIcon?: boolean;
    showOverdue?: boolean;
    className?: string;
}

export function DateField({
    value,
    format = "medium",
    showIcon = false,
    showOverdue = false,
    className,
}: DateFieldProps) {
    if (!value) return <span className="text-muted-foreground">—</span>;

    const date = typeof value === "string" ? new Date(value) : value;
    const isOverdue = showOverdue && date < new Date();

    const formatted =
        format === "relative"
            ? formatRelativeTime(date)
            : formatDate(date.toISOString());

    return (
        <span
            className={cn(
                "flex items-center gap-1.5 text-sm",
                isOverdue && "text-destructive",
                className
            )}
        >
            {showIcon && <Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
            {formatted}
        </span>
    );
}

// ─── User Field ───
interface UserFieldProps {
    name: string;
    avatar?: string;
    email?: string;
    showAvatar?: boolean;
    showName?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function UserField({
    name,
    avatar,
    email,
    showAvatar = true,
    showName = true,
    size = "sm",
    className,
}: UserFieldProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showAvatar && (
                <Avatar name={name} src={avatar} size={size} />
            )}
            {showName && (
                <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{name}</span>
                    {email && <span className="text-xs text-muted-foreground">{email}</span>}
                </div>
            )}
        </div>
    );
}

// ─── Users Field (Multiple) ───
interface UsersFieldProps {
    users: { name: string; avatar?: string }[];
    max?: number;
    size?: "sm" | "md";
    className?: string;
}

export function UsersField({ users, max = 3, size = "sm", className }: UsersFieldProps) {
    const visible = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className={cn("flex items-center -space-x-2", className)}>
            {visible.map((user, i) => (
                <Avatar key={i} name={user.name} src={user.avatar} size={size} className="border-2 border-background" />
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        size === "sm" ? "h-7 w-7" : "h-9 w-9",
                        "rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background"
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}

// ─── Boolean Field ───
interface BooleanFieldProps {
    value: boolean;
    trueLabel?: string;
    falseLabel?: string;
    showLabel?: boolean;
    variant?: "icon" | "badge" | "text";
}

export function BooleanField({
    value,
    trueLabel = "Yes",
    falseLabel = "No",
    showLabel = false,
    variant = "icon",
}: BooleanFieldProps) {
    if (variant === "badge") {
        return (
            <Badge variant={value ? "success" : "ghost"}>
                {value ? trueLabel : falseLabel}
            </Badge>
        );
    }

    if (variant === "text") {
        return (
            <span className={value ? "text-success" : "text-muted-foreground"}>
                {value ? trueLabel : falseLabel}
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            {value ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            {showLabel && (
                <span className={value ? "text-success" : "text-muted-foreground"}>
                    {value ? trueLabel : falseLabel}
                </span>
            )}
        </div>
    );
}

// ─── Rating Field ───
interface RatingFieldProps {
    value: number;
    max?: number;
    showValue?: boolean;
    size?: "sm" | "md";
}

export function RatingField({ value, max = 5, showValue = true, size = "sm" }: RatingFieldProps) {
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

    const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <Star key={`full-${i}`} className={cn(iconSize, "fill-warning text-warning")} />
                ))}
                {hasHalfStar && <StarHalf className={cn(iconSize, "fill-warning text-warning")} />}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <Star key={`empty-${i}`} className={cn(iconSize, "text-muted-foreground/30")} />
                ))}
            </div>
            {showValue && (
                <span className="text-xs text-muted-foreground ml-1">
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
}

// ─── Tags Field ───
interface TagsFieldProps {
    tags: string[] | { label: string; color?: string }[];
    max?: number;
    size?: "sm" | "md";
}

export function TagsField({ tags, max = 3, size = "sm" }: TagsFieldProps) {
    const normalizedTags = tags.map((t) => (typeof t === "string" ? { label: t } : t));
    const visible = normalizedTags.slice(0, max);
    const remaining = normalizedTags.length - max;

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {visible.map((tag, i) => (
                <Badge
                    key={i}
                    variant="secondary"
                    className={cn(
                        size === "sm" && "text-xs px-1.5 py-0",
                        tag.color && `bg-${tag.color}-100 text-${tag.color}-700`
                    )}
                >
                    {tag.label}
                </Badge>
            ))}
            {remaining > 0 && (
                <span className="text-xs text-muted-foreground">+{remaining}</span>
            )}
        </div>
    );
}

// ─── Email Field ───
interface EmailFieldProps {
    value: string;
    showIcon?: boolean;
    asLink?: boolean;
}

export function EmailField({ value, showIcon = true, asLink = true }: EmailFieldProps) {
    const content = (
        <span className="flex items-center gap-1.5 text-sm">
            {showIcon && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={asLink ? "text-primary hover:underline" : ""}>{value}</span>
        </span>
    );

    return asLink ? <a href={`mailto:${value}`}>{content}</a> : content;
}

// ─── Phone Field ───
interface PhoneFieldProps {
    value: string;
    showIcon?: boolean;
    asLink?: boolean;
}

export function PhoneField({ value, showIcon = true, asLink = true }: PhoneFieldProps) {
    const content = (
        <span className="flex items-center gap-1.5 text-sm">
            {showIcon && <Phone className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={asLink ? "text-primary hover:underline" : ""}>{value}</span>
        </span>
    );

    return asLink ? <a href={`tel:${value}`}>{content}</a> : content;
}

// ─── URL Field ───
interface URLFieldProps {
    value: string;
    label?: string;
    showIcon?: boolean;
    external?: boolean;
}

export function URLField({ value, label, showIcon = true, external = true }: URLFieldProps) {
    const displayLabel = label ?? new URL(value).hostname;

    return (
        <a
            href={value}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
            {showIcon && <LinkIcon className="h-3.5 w-3.5" />}
            <span>{displayLabel}</span>
            {external && <ExternalLink className="h-3 w-3" />}
        </a>
    );
}

// ─── Location Field ───
interface LocationFieldProps {
    value: string;
    showIcon?: boolean;
}

export function LocationField({ value, showIcon = true }: LocationFieldProps) {
    return (
        <span className="flex items-center gap-1.5 text-sm">
            {showIcon && <MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
            <span>{value}</span>
        </span>
    );
}

// ─── Empty Field ───
export function EmptyField({ placeholder = "—" }: { placeholder?: string }) {
    return <span className="text-muted-foreground">{placeholder}</span>;
}

// ─── Generic Field Renderer ───
interface FieldRendererProps {
    value: unknown;
    config: FieldConfig;
    className?: string;
}

export function FieldRenderer({ value, config, className }: FieldRendererProps) {
    if (value === null || value === undefined || value === "") {
        return <EmptyField />;
    }

    if (config.render) {
        return <>{config.render(value)}</>;
    }

    switch (config.type) {
        case "status":
            return (
                <StatusField
                    value={value as string}
                    variantMap={config.variantMap}
                    labelMap={config.labelMap}
                />
            );
        case "priority":
            return <PriorityField value={value as string} />;
        case "progress":
            return (
                <ProgressField
                    value={value as number}
                    showPercentage={config.showPercentage}
                    colorThresholds={config.colorThresholds}
                />
            );
        case "currency":
            return <CurrencyField value={value as number} className={className} />;
        case "percentage":
            return <PercentageField value={value as number} className={className} />;
        case "date":
        case "datetime":
            return <DateField value={value as string} />;
        case "relative_time":
            return <DateField value={value as string} format="relative" />;
        case "user":
            if (typeof value === "string") {
                return <UserField name={value} showAvatar={config.showAvatar} showName={config.showName} />;
            }
            return (
                <UserField
                    name={(value as { name: string }).name}
                    avatar={(value as { avatar?: string }).avatar}
                    showAvatar={config.showAvatar}
                    showName={config.showName}
                />
            );
        case "users":
            return <UsersField users={value as { name: string; avatar?: string }[]} />;
        case "boolean":
            return <BooleanField value={value as boolean} />;
        case "rating":
            return <RatingField value={value as number} />;
        case "tags":
            return <TagsField tags={value as string[]} />;
        case "email":
            return <EmailField value={value as string} />;
        case "phone":
            return <PhoneField value={value as string} />;
        case "url":
            return <URLField value={value as string} />;
        case "location":
            return <LocationField value={value as string} />;
        case "number":
            return <span className="tabular-nums">{(value as number).toLocaleString()}</span>;
        case "text":
        default:
            return <span className={className}>{String(value)}</span>;
    }
}
