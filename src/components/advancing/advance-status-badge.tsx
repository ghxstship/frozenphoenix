"use client";

import { Badge } from "@/components/ui/badge";
import {
    ADVANCE_ITEM_STATUS_MAP,
    ADVANCE_PRIORITY_MAP,
    ADVANCE_STATUS_MAP,
    ADVANCE_TYPE_MAP,
    CATALOG_CATEGORY_TYPE_MAP,
} from "@/config/advancing-config";
import type {
    AdvanceItemStatus,
    AdvancePriority,
    AdvanceStatus,
    AdvanceType,
    CatalogCategoryType,
} from "@/types";

export function AdvanceStatusBadge({ status }: { status: AdvanceStatus }) {
    const config = ADVANCE_STATUS_MAP[status];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    const Icon = config.icon;
    return (
        <Badge variant={config.variant}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {config.label}
        </Badge>
    );
}

export function AdvanceItemStatusBadge({ status }: { status: AdvanceItemStatus }) {
    const config = ADVANCE_ITEM_STATUS_MAP[status];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    const Icon = config.icon;
    return (
        <Badge variant={config.variant}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {config.label}
        </Badge>
    );
}

export function AdvancePriorityBadge({ priority }: { priority: AdvancePriority }) {
    const config = ADVANCE_PRIORITY_MAP[priority];
    if (!config) return <Badge variant="outline">{priority}</Badge>;
    const Icon = config.icon;
    return (
        <Badge variant={config.variant}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {config.label}
        </Badge>
    );
}

export function AdvanceTypeBadge({ type }: { type: AdvanceType }) {
    const config = ADVANCE_TYPE_MAP[type];
    if (!config) return <Badge variant="outline">{type}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function CategoryTypeBadge({ type }: { type: CatalogCategoryType }) {
    const config = CATALOG_CATEGORY_TYPE_MAP[type];
    if (!config) return <Badge variant="outline">{type}</Badge>;
    const Icon = config.icon;
    return (
        <Badge variant={config.variant}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {config.label}
        </Badge>
    );
}
