/* ═══════════════════════════════════════════════════════════════
   ADVANCING CONFIG — Single Source of Truth for Production Advancing
   ═══════════════════════════════════════════════════════════════
   
   3NF Compliance:
   - All status/type/priority configs defined once
   - Status transition maps are declarative, not imperative
   - Labels, icons, variants, and descriptions co-located
   ═══════════════════════════════════════════════════════════════ */

import {
    Box,
    CheckCircle2,
    Circle,
    CircleDot,
    Clock,
    FileCheck,
    Loader2,
    Package,
    PackageCheck,
    Pause,
    Play,
    Send,
    Settings2,
    Truck,
    Undo2,
    X,
    Zap,
} from "lucide-react";
import type {
    AdvanceItemStatus,
    AdvancePriority,
    AdvanceStatus,
    AdvanceType,
    CatalogCategoryType,
    CatalogItemStatus,
    PricingTier,
    WeatherRating,
} from "@/types";
import type { EnumConfig } from "./config-utils";

// ═══════════════════════════════════════════════════════════════
// ADVANCE STATUS
// ═══════════════════════════════════════════════════════════════

export const ADVANCE_STATUSES: EnumConfig<AdvanceStatus>[] = [
    {
        value: "draft",
        label: "Draft",
        variant: "ghost",
        icon: Circle,
        description: "Not yet submitted",
    },
    {
        value: "submitted",
        label: "Submitted",
        variant: "info",
        icon: Send,
        description: "Awaiting review",
    },
    {
        value: "in_review",
        label: "In Review",
        variant: "warning",
        icon: Clock,
        description: "Under approval review",
    },
    {
        value: "approved",
        label: "Approved",
        variant: "success",
        icon: CheckCircle2,
        description: "Approved, ready for fulfillment",
    },
    {
        value: "in_progress",
        label: "In Progress",
        variant: "default",
        icon: Loader2,
        description: "Being fulfilled",
    },
    {
        value: "fulfilled",
        label: "Fulfilled",
        variant: "info",
        icon: PackageCheck,
        description: "All items delivered",
    },
    {
        value: "completed",
        label: "Completed",
        variant: "success",
        icon: FileCheck,
        description: "Advance closed out",
    },
    {
        value: "cancelled",
        label: "Cancelled",
        variant: "destructive",
        icon: X,
        description: "Cancelled",
    },
];

export const ADVANCE_STATUS_MAP = Object.fromEntries(
    ADVANCE_STATUSES.map((s) => [s.value, s])
) as Record<AdvanceStatus, EnumConfig<AdvanceStatus>>;

export const ADVANCE_STATUS_TRANSITIONS: Record<AdvanceStatus, AdvanceStatus[]> = {
    draft: ["submitted", "cancelled"],
    submitted: ["in_review", "cancelled"],
    in_review: ["approved", "submitted", "cancelled"],
    approved: ["in_progress", "cancelled"],
    in_progress: ["fulfilled", "cancelled"],
    fulfilled: ["completed"],
    completed: [],
    cancelled: [],
};

export function canTransitionAdvance(current: AdvanceStatus, next: AdvanceStatus): boolean {
    return ADVANCE_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE ITEM STATUS
// ═══════════════════════════════════════════════════════════════

export const ADVANCE_ITEM_STATUSES: EnumConfig<AdvanceItemStatus>[] = [
    {
        value: "pending",
        label: "Pending",
        variant: "ghost",
        icon: Circle,
        description: "Awaiting confirmation",
    },
    {
        value: "confirmed",
        label: "Confirmed",
        variant: "info",
        icon: CircleDot,
        description: "Vendor confirmed",
    },
    {
        value: "in_transit",
        label: "In Transit",
        variant: "warning",
        icon: Truck,
        description: "En route to venue",
    },
    {
        value: "delivered",
        label: "Delivered",
        variant: "info",
        icon: Package,
        description: "On-site, not installed",
    },
    {
        value: "installed",
        label: "Installed",
        variant: "default",
        icon: Settings2,
        description: "Set up at location",
    },
    {
        value: "operational",
        label: "Operational",
        variant: "success",
        icon: Play,
        description: "Active and in use",
    },
    {
        value: "struck",
        label: "Struck",
        variant: "warning",
        icon: Pause,
        description: "Torn down post-show",
    },
    {
        value: "returned",
        label: "Returned",
        variant: "info",
        icon: Undo2,
        description: "Back to vendor/warehouse",
    },
    {
        value: "complete",
        label: "Complete",
        variant: "success",
        icon: CheckCircle2,
        description: "Line item closed",
    },
];

export const ADVANCE_ITEM_STATUS_MAP = Object.fromEntries(
    ADVANCE_ITEM_STATUSES.map((s) => [s.value, s])
) as Record<AdvanceItemStatus, EnumConfig<AdvanceItemStatus>>;

export const ADVANCE_ITEM_STATUS_TRANSITIONS: Record<AdvanceItemStatus, AdvanceItemStatus[]> = {
    pending: ["confirmed", "complete"],
    confirmed: ["in_transit", "delivered", "complete"],
    in_transit: ["delivered"],
    delivered: ["installed", "operational", "complete"],
    installed: ["operational", "struck"],
    operational: ["struck"],
    struck: ["returned", "complete"],
    returned: ["complete"],
    complete: [],
};

export function canTransitionAdvanceItem(
    current: AdvanceItemStatus,
    next: AdvanceItemStatus
): boolean {
    return ADVANCE_ITEM_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE TYPE
// ═══════════════════════════════════════════════════════════════

export const ADVANCE_TYPES: EnumConfig<AdvanceType>[] = [
    {
        value: "pre_event",
        label: "Pre-Event",
        variant: "info",
        description: "Pre-production ordering",
    },
    {
        value: "load_in",
        label: "Load-In",
        variant: "warning",
        description: "Load-in day requirements",
    },
    { value: "show_day", label: "Show Day", variant: "success", description: "Day-of-show needs" },
    { value: "strike", label: "Strike", variant: "warning", description: "Strike & teardown" },
    {
        value: "post_event",
        label: "Post-Event",
        variant: "ghost",
        description: "Post-event wrap items",
    },
];

export const ADVANCE_TYPE_MAP = Object.fromEntries(
    ADVANCE_TYPES.map((t) => [t.value, t])
) as Record<AdvanceType, EnumConfig<AdvanceType>>;

// ═══════════════════════════════════════════════════════════════
// ADVANCE PRIORITY
// ═══════════════════════════════════════════════════════════════

export const ADVANCE_PRIORITIES: EnumConfig<AdvancePriority>[] = [
    { value: "low", label: "Low", variant: "ghost" },
    { value: "medium", label: "Medium", variant: "secondary" },
    { value: "high", label: "High", variant: "warning" },
    { value: "urgent", label: "Urgent", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive", icon: Zap },
];

export const ADVANCE_PRIORITY_MAP = Object.fromEntries(
    ADVANCE_PRIORITIES.map((p) => [p.value, p])
) as Record<AdvancePriority, EnumConfig<AdvancePriority>>;

// ═══════════════════════════════════════════════════════════════
// CATALOG CATEGORY TYPE
// ═══════════════════════════════════════════════════════════════

export const CATALOG_CATEGORY_TYPES: EnumConfig<CatalogCategoryType>[] = [
    { value: "site", label: "Site", variant: "default", icon: Box },
    { value: "technical", label: "Technical", variant: "warning", icon: Zap },
    { value: "hospitality", label: "Hospitality", variant: "success", icon: Package },
    { value: "food_beverage", label: "Food & Beverage", variant: "info", icon: Package },
    { value: "retail", label: "Retail", variant: "secondary", icon: Box },
    { value: "workplace", label: "Workplace", variant: "default", icon: Settings2 },
    { value: "travel", label: "Travel", variant: "secondary", icon: Truck },
    { value: "labor", label: "Labor", variant: "info", icon: Circle },
    { value: "access", label: "Access", variant: "info", icon: Box },
    { value: "production", label: "Production", variant: "default", icon: Settings2 },
    { value: "custom", label: "Custom", variant: "ghost", icon: Circle },
];

export const CATALOG_CATEGORY_TYPE_MAP = Object.fromEntries(
    CATALOG_CATEGORY_TYPES.map((t) => [t.value, t])
) as Record<CatalogCategoryType, EnumConfig<CatalogCategoryType>>;

// ═══════════════════════════════════════════════════════════════
// CATALOG ITEM STATUS
// ═══════════════════════════════════════════════════════════════

export const CATALOG_ITEM_STATUSES: EnumConfig<CatalogItemStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "discontinued", label: "Discontinued", variant: "destructive" },
    { value: "out_of_stock", label: "Out of Stock", variant: "warning" },
    { value: "seasonal", label: "Seasonal", variant: "info" },
    { value: "draft", label: "Draft", variant: "ghost" },
];

export const CATALOG_ITEM_STATUS_MAP = Object.fromEntries(
    CATALOG_ITEM_STATUSES.map((s) => [s.value, s])
) as Record<CatalogItemStatus, EnumConfig<CatalogItemStatus>>;

// ═══════════════════════════════════════════════════════════════
// APPROVAL THRESHOLDS (configurable per-org, these are defaults)
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_APPROVAL_THRESHOLDS = {
    auto_approve_max: 1000,
    director_review_max: 10000,
    exec_review_min: 10001,
    escalation_hours_director: 48,
    escalation_hours_exec: 72,
} as const;

// ═══════════════════════════════════════════════════════════════
// CURRENCY FORMATTING
// ═══════════════════════════════════════════════════════════════

export function formatAdvanceCost(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE NUMBER PREFIX
// ═══════════════════════════════════════════════════════════════

export const ADVANCE_NUMBER_PREFIX = "PA";

// ═══════════════════════════════════════════════════════════════
// DEFAULT PAGINATION
// ═══════════════════════════════════════════════════════════════

export const ADVANCING_PAGE_SIZE = 25;
export const CATALOG_PAGE_SIZE = 50;

// ═══════════════════════════════════════════════════════════════
// WEATHER RATING
// ═══════════════════════════════════════════════════════════════

export const WEATHER_RATINGS: EnumConfig<WeatherRating>[] = [
    { value: "indoor_only", label: "Indoor Only", variant: "ghost" },
    { value: "sheltered", label: "Sheltered", variant: "info" },
    { value: "outdoor_rated", label: "Outdoor Rated", variant: "warning" },
    { value: "all_weather", label: "All Weather", variant: "success" },
    { value: "not_applicable", label: "N/A", variant: "ghost" },
];

export const WEATHER_RATING_MAP = Object.fromEntries(
    WEATHER_RATINGS.map((w) => [w.value, w])
) as Record<WeatherRating, EnumConfig<WeatherRating>>;

// ═══════════════════════════════════════════════════════════════
// PRICING TIER
// ═══════════════════════════════════════════════════════════════

export const PRICING_TIERS: EnumConfig<PricingTier>[] = [
    {
        value: "basic",
        label: "Basic",
        variant: "ghost",
        description: "Entry-level spec, budget-conscious",
    },
    {
        value: "standard",
        label: "Standard",
        variant: "default",
        description: "Industry-standard, professional-grade",
    },
    {
        value: "premium",
        label: "Premium",
        variant: "info",
        description: "Top-tier, flagship equipment, white-glove service",
    },
];

export const PRICING_TIER_MAP = Object.fromEntries(
    PRICING_TIERS.map((t) => [t.value, t])
) as Record<PricingTier, EnumConfig<PricingTier>>;

// ═══════════════════════════════════════════════════════════════
// CURRENCY MULTIPLIERS (for multi-market pricing)
// ═══════════════════════════════════════════════════════════════

export const CURRENCY_MULTIPLIERS: Record<
    string,
    { code: string; name: string; symbol: string; multiplier: number }
> = {
    USD: { code: "USD", name: "US Dollar", symbol: "$", multiplier: 1.0 },
    GBP: { code: "GBP", name: "British Pound", symbol: "£", multiplier: 0.79 },
    EUR: { code: "EUR", name: "Euro", symbol: "€", multiplier: 0.92 },
    AED: { code: "AED", name: "UAE Dirham", symbol: "د.إ", multiplier: 3.67 },
    AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", multiplier: 1.55 },
    CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", multiplier: 1.38 },
    MXN: { code: "MXN", name: "Mexican Peso", symbol: "MX$", multiplier: 17.2 },
    BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", multiplier: 5.1 },
};
