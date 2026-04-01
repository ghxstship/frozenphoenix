"use client";

/* ═══════════════════════════════════════════════════════════════
   LIST PAGE VIEW CONTENT — Data view renderer for ListPageShell

   Renders the appropriate data view (table, board, cards, timeline,
   calendar, gallery, chart, map, workload) based on the active view
   mode. Extracted from ListPageShell for maintainability.

   On mobile (< md), table view automatically reflows to a stacked
   card layout with gesture support:
   • Swipe left → reveals row action buttons (iOS-style)
   • Long-press → opens context menu (DropdownMenu)
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import dynamic from "next/dynamic";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { type ViewMode } from "@/components/ui/view-switcher";
import { AlertBanner } from "@/components/ui/alert-banner";
import { getChartColor } from "@/components/data-view/chart-colors";
import { FieldRenderer } from "@/components/data-view/field-renderers";
import { useBreakpoint } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { useDrag } from "@use-gesture/react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { hapticSelection, hapticTap } from "@/lib/haptics";
import type { ListAlertDef, ListPageConfig } from "@/types/list-page-config";
import type { EntityRecord } from "@/types/entity";

// Performance: Alternate data views are dynamically imported — only loaded when user
// switches to that view mode. DataTable stays eager as the default view.

type DataBoardProps = React.ComponentProps<
    typeof import("@/components/data-view/data-board").DataBoard
>;
type DataCardsProps = React.ComponentProps<
    typeof import("@/components/data-view/data-cards").DataCards
>;
type DataTimelineProps = React.ComponentProps<
    typeof import("@/components/data-view/data-timeline").DataTimeline
>;
type DataCalendarProps = React.ComponentProps<
    typeof import("@/components/data-view/data-calendar").DataCalendar
>;
type DataGalleryProps = React.ComponentProps<
    typeof import("@/components/data-view/data-gallery").DataGallery
>;
type DataChartProps = React.ComponentProps<
    typeof import("@/components/data-view/data-chart").DataChart
>;
type DataMapProps = React.ComponentProps<typeof import("@/components/data-view/data-map").DataMap>;
type DataWorkloadProps = React.ComponentProps<
    typeof import("@/components/data-view/data-workload").DataWorkload
>;

const DataBoard = dynamic(() =>
    import("@/components/data-view/data-board").then((m) => m.DataBoard)
) as unknown as React.ComponentType<DataBoardProps>;
const DataCards = dynamic(() =>
    import("@/components/data-view/data-cards").then((m) => m.DataCards)
) as unknown as React.ComponentType<DataCardsProps>;
const DataTimeline = dynamic(() =>
    import("@/components/data-view/data-timeline").then((m) => m.DataTimeline)
) as unknown as React.ComponentType<DataTimelineProps>;
const DataCalendar = dynamic(() =>
    import("@/components/data-view/data-calendar").then((m) => m.DataCalendar)
) as unknown as React.ComponentType<DataCalendarProps>;
const DataGallery = dynamic(() =>
    import("@/components/data-view/data-gallery").then((m) => m.DataGallery)
) as unknown as React.ComponentType<DataGalleryProps>;
const DataChart = dynamic(() =>
    import("@/components/data-view/data-chart").then((m) => m.DataChart)
) as unknown as React.ComponentType<DataChartProps>;
const DataMap = dynamic(() =>
    import("@/components/data-view/data-map").then((m) => m.DataMap)
) as unknown as React.ComponentType<DataMapProps>;
const DataWorkload = dynamic(() =>
    import("@/components/data-view/data-workload").then((m) => m.DataWorkload)
) as unknown as React.ComponentType<DataWorkloadProps>;

// ─── List Alert Renderer ─────────────────────────────────────

export const ListAlertRenderer = React.memo(function ListAlertRenderer({
    alert,
    records,
}: {
    alert: ListAlertDef;
    records: EntityRecord[];
}) {
    if (!alert.when(records)) return null;
    const message = typeof alert.message === "function" ? alert.message(records) : alert.message;
    return <AlertBanner message={message} severity={alert.severity} icon={alert.icon} />;
});

// ─── Mobile Card Reflow ─────────────────────────────────────────
// When the viewport is below `md`, tables reflow to stacked cards.
// The first column becomes the card title, the second becomes the
// subtitle, and any column with "status" in its id renders as a badge.
//
// Gestures:
// • Swipe left → reveals row action buttons (iOS-style)
// • Long-press → opens context menu (DropdownMenu)

/** Swipe reveal threshold (px) */
const SWIPE_REVEAL_WIDTH = 120;
/** Long-press duration (ms) */
const LONG_PRESS_DURATION = 500;

// ─── Swipe Reveal Card Wrapper ───

function SwipeRevealCard({
    children,
    actionContent,
    isRevealed,
    onReveal,
    onClose,
    onLongPress,
    onClick,
    enabled,
}: {
    children: React.ReactNode;
    actionContent: React.ReactNode;
    isRevealed: boolean;
    onReveal: () => void;
    onClose: () => void;
    onLongPress?: (() => void) | undefined;
    onClick?: (() => void) | undefined;
    enabled: boolean;
}) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const reducedMotion = useReducedMotion();

    // Swipe gesture
    const bind = useDrag(
        ({ down, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
            if (!enabled || reducedMotion) return;

            // Tap detection — if it's a tap, handle click
            if (tap) {
                if (isRevealed) {
                    onClose();
                } else {
                    onClick?.();
                }
                return;
            }

            const el = cardRef.current;
            if (!el) return;

            if (down) {
                // Track horizontal swipe
                const offset = isRevealed
                    ? Math.min(0, Math.max(-SWIPE_REVEAL_WIDTH, mx - SWIPE_REVEAL_WIDTH))
                    : Math.min(0, mx);
                el.style.transform = `translateX(${offset}px)`;
                el.style.transition = "none";
            } else {
                // Released — decide snap position
                const flung = vx > 0.3 && dx < 0; // fast left swipe
                const pastThreshold = Math.abs(mx) > SWIPE_REVEAL_WIDTH * 0.4;
                const shouldReveal = isRevealed
                    ? !(vx > 0.3 && dx > 0) && !(Math.abs(mx) > SWIPE_REVEAL_WIDTH * 0.4 && mx > 0)
                    : flung || (pastThreshold && mx < 0);

                el.style.transition = "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)";

                if (shouldReveal) {
                    el.style.transform = `translateX(-${SWIPE_REVEAL_WIDTH}px)`;
                    if (!isRevealed) {
                        hapticTap();
                        onReveal();
                    }
                } else {
                    el.style.transform = "translateX(0)";
                    if (isRevealed) onClose();
                }

                // Clean up transition
                setTimeout(() => {
                    if (el) el.style.transition = "";
                }, 260);
            }
        },
        {
            enabled: enabled && !reducedMotion,
            axis: "x",
            filterTaps: true,
            pointer: { touch: true },
            from: () => [0, 0],
        }
    );

    // Long-press detection
    const handleTouchStart = React.useCallback(() => {
        if (!onLongPress || !enabled || reducedMotion) return;
        longPressTimer.current = setTimeout(() => {
            hapticSelection();
            onLongPress();
        }, LONG_PRESS_DURATION);
    }, [onLongPress, enabled, reducedMotion]);

    const cancelLongPress = React.useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Sync reveal state with DOM when controlled externally (e.g. another card opened)
    React.useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        if (!isRevealed) {
            el.style.transition = "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)";
            el.style.transform = "translateX(0)";
            setTimeout(() => {
                if (el) el.style.transition = "";
            }, 260);
        }
    }, [isRevealed]);

    return (
        <div className="relative overflow-hidden rounded-lg" role="listitem">
            {/* Action buttons behind the card */}
            <div
                className="absolute right-0 top-0 bottom-0 flex items-stretch"
                style={{ width: SWIPE_REVEAL_WIDTH }}
            >
                {actionContent}
            </div>

            {/* Card content — slides to reveal actions */}
            <div
                ref={cardRef}
                {...bind()}
                onTouchStart={handleTouchStart}
                onTouchEnd={cancelLongPress}
                onTouchCancel={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={cn(
                    "relative bg-card border border-border rounded-lg p-4 flex flex-col gap-2",
                    "will-change-transform",
                    onClick && "cursor-pointer"
                )}
                style={{ touchAction: "pan-y" }}
                tabIndex={onClick ? 0 : undefined}
                onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onClick) {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                {children}
            </div>
        </div>
    );
}

function MobileListCards<T extends EntityRecord>({
    data,
    columns,
    onRowClick,
    renderRowActionItems,
    emptyState,
}: {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: ((row: T) => void) | undefined;
    renderRowActionItems?: ((row: T) => React.ReactNode) | undefined;
    emptyState?: React.ReactNode | undefined;
}) {
    const visibleColumns = columns.filter((c) => !c.hidden);
    const titleCol = visibleColumns[0];
    const subtitleCol = visibleColumns[1];
    const statusCol = visibleColumns.find(
        (c) => c.id.includes("status") || c.fieldType === "status"
    );
    // Detail columns = everything not already used as title/subtitle/status
    const detailCols = visibleColumns
        .filter((c) => c !== titleCol && c !== subtitleCol && c !== statusCol)
        .slice(0, 3); // Cap at 3 detail fields on mobile cards

    const getCellValue = (row: T, col: ColumnDef<T>) => {
        if (col.accessorFn) return col.accessorFn(row);
        if (col.accessorKey) return row[col.accessorKey];
        return undefined;
    };

    // Single-reveal pattern: only one card can be swiped open at a time
    const [revealedId, setRevealedId] = React.useState<string | null>(null);
    // Long-press triggered menu — stores ref to trigger button
    const triggerRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

    if (data.length === 0) {
        return (
            <>
                {emptyState ?? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        No data available
                    </p>
                )}
            </>
        );
    }

    return (
        <div className="space-y-2" role="list" aria-label="Data cards">
            {data.map((row) => {
                const key = String(row.id ?? "");
                const title = titleCol ? String(getCellValue(row, titleCol) ?? "") : key;
                const subtitle = subtitleCol ? getCellValue(row, subtitleCol) : null;
                const status = statusCol ? String(getCellValue(row, statusCol) ?? "") : null;

                return (
                    <SwipeRevealCard
                        key={key}
                        isRevealed={revealedId === key}
                        onReveal={() => setRevealedId(key)}
                        onClose={() => setRevealedId(null)}
                        onClick={() => onRowClick?.(row)}
                        onLongPress={
                            renderRowActionItems
                                ? () => {
                                      // Trigger the kebab menu button via click
                                      const btn = triggerRefs.current.get(key);
                                      btn?.click();
                                  }
                                : undefined
                        }
                        enabled={!!renderRowActionItems}
                        actionContent={
                            renderRowActionItems ? (
                                <div className="flex h-full">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="default"
                                                className="flex-1 rounded-none text-xs font-medium px-4"
                                                aria-label="Actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <div
                                                onClick={(e: React.MouseEvent) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {renderRowActionItems(row)}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : null
                        }
                    >
                        {/* Header row: title + status + actions */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">{title}</p>
                                {subtitle != null && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {subtitleCol?.fieldType ? (
                                            <FieldRenderer
                                                value={subtitle}
                                                config={{
                                                    type: subtitleCol.fieldType,
                                                    ...subtitleCol.fieldConfig,
                                                }}
                                            />
                                        ) : (
                                            String(subtitle)
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {status && (
                                    <Badge
                                        variant={getStatusVariant(status)}
                                        className="text-[10px] h-5"
                                    >
                                        {getStatusLabel(status)}
                                    </Badge>
                                )}
                                {renderRowActionItems && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                ref={(el) => {
                                                    if (el) triggerRefs.current.set(key, el);
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 min-h-[44px] min-w-[44px]"
                                                aria-label="Row actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <div
                                                onClick={(e: React.MouseEvent) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {renderRowActionItems(row)}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                        {/* Detail fields */}
                        {detailCols.length > 0 && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-border/50">
                                {detailCols.map((col) => {
                                    const val = getCellValue(row, col);
                                    if (val == null) return null;
                                    return (
                                        <div key={col.id} className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                                                {col.header}
                                            </p>
                                            <p className="text-xs truncate">
                                                {col.render ? (
                                                    col.render(val, row)
                                                ) : col.fieldType ? (
                                                    <FieldRenderer
                                                        value={val}
                                                        config={{
                                                            type: col.fieldType,
                                                            ...col.fieldConfig,
                                                        }}
                                                    />
                                                ) : (
                                                    String(val)
                                                )}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SwipeRevealCard>
                );
            })}
        </div>
    );
}

// ─── View Content Renderer ──────────────────────────────────

export interface ViewContentProps {
    viewMode: ViewMode;
    filtered: EntityRecord[];
    dtColumns: ColumnDef<EntityRecord>[];
    config: ListPageConfig;
    title: string;
    hasBulkActions: boolean;
    selectedKeys: Set<string>;
    setSelectedKeys: (keys: Set<string>) => void;
    handleRowClick: (record: EntityRecord) => void;
    renderRowActions?: ((row: EntityRecord) => React.ReactNode) | undefined;
    renderRowActionItems?: ((row: EntityRecord) => React.ReactNode) | undefined;
    onBoardDragEnd?: ((itemId: string, fromColumn: string, toColumn: string) => void) | undefined;
    emptyState?: React.ReactNode | undefined;
    isLoading?: boolean | undefined;
    /** Column/field preferences for visibility + order */
    fieldVisibility: Record<string, boolean>;
    fieldOrder: string[];
}

export const ViewContent = React.memo(function ViewContent({
    viewMode,
    filtered,
    dtColumns,
    config,
    title,
    hasBulkActions,
    selectedKeys,
    setSelectedKeys,
    handleRowClick,
    renderRowActions,
    renderRowActionItems,
    onBoardDragEnd,
    emptyState,
    isLoading,
    fieldVisibility,
    fieldOrder,
}: ViewContentProps) {
    // ─── Table (with mobile card reflow) ───

    const { isMobile: isMobileView } = useBreakpoint();

    if (viewMode === "table") {
        if (isMobileView) {
            return (
                <MobileListCards
                    data={filtered}
                    columns={dtColumns}
                    onRowClick={handleRowClick}
                    renderRowActionItems={renderRowActionItems}
                    emptyState={emptyState}
                />
            );
        }
        return (
            <DataTable
                data={filtered}
                columns={dtColumns}
                keyField={"id" as keyof EntityRecord}
                defaultSort={
                    config.defaultSort
                        ? {
                              column: config.defaultSort.column,
                              direction: config.defaultSort.direction,
                          }
                        : undefined
                }
                searchable={false}
                selectable={hasBulkActions}
                selectedKeys={hasBulkActions ? selectedKeys : undefined}
                onSelectionChange={hasBulkActions ? setSelectedKeys : undefined}
                onRowClick={handleRowClick}
                rowActions={renderRowActions}
                caption={`${title} list`}
                emptyState={emptyState}
                loading={isLoading}
            />
        );
    }

    // ─── Board (Kanban) ───
    if (viewMode === "board" && config.boardConfig) {
        const bc = config.boardConfig;
        const uniqueValues = Array.from(
            new Set(filtered.map((r) => String(r[bc.groupByKey] ?? "")))
        );
        const boardColumns = uniqueValues.map((val) => ({
            id: val,
            title: bc.columnLabels?.[val] ?? val,
            variant: bc.columnVariants?.[val],
            filter: (item: EntityRecord) => String(item[bc.groupByKey] ?? "") === val,
        }));
        return (
            <DataBoard
                data={filtered as object[]}
                columns={
                    boardColumns as {
                        id: string;
                        title: string;
                        variant?: import("@/config/ui-variants").BadgeVariant;
                        filter: (item: object) => boolean;
                    }[]
                }
                keyField={"id" as keyof object}
                cardTitle={(bc.cardTitleKey ?? "name") as keyof object}
                cardSubtitle={bc.cardSubtitleKey as keyof object | undefined}
                cardFields={[]}
                actions={renderRowActions as ((row: object) => React.ReactNode) | undefined}
                onCardClick={handleRowClick as (item: object) => void}
                onDragEnd={onBoardDragEnd}
            />
        );
    }

    // ─── Cards ───
    if (viewMode === "cards" && config.cardConfig) {
        const cc = config.cardConfig;
        const allCardFields = (cc.fields ?? []).map((f) => ({
            id: f.id,
            label: f.label,
            accessorKey: f.accessorKey as keyof EntityRecord | undefined,
            accessorFn: f.accessorFn as ((row: EntityRecord) => unknown) | undefined,
            fieldType: f.fieldType,
            fieldConfig: f.fieldConfig,
            render: f.render as
                | ((value: unknown, row: EntityRecord) => React.ReactNode)
                | undefined,
        }));
        // Apply field visibility + order preferences
        const fieldMap = new Map(allCardFields.map((f) => [f.id, f]));
        const orderedFields: typeof allCardFields = [];
        for (const id of fieldOrder) {
            const f = fieldMap.get(id);
            if (f && fieldVisibility[id] !== false) orderedFields.push(f);
        }
        // Append any fields not in the order
        for (const f of allCardFields) {
            if (!fieldOrder.includes(f.id) && fieldVisibility[f.id] !== false)
                orderedFields.push(f);
        }
        return (
            <DataCards
                data={filtered}
                keyField={"id" as keyof EntityRecord}
                title={(cc.titleKey ?? "name") as keyof EntityRecord}
                subtitle={cc.subtitleKey as keyof EntityRecord | undefined}
                badge={cc.statusKey as keyof EntityRecord | undefined}
                fields={orderedFields}
                actions={renderRowActions}
                onCardClick={handleRowClick}
            />
        );
    }

    // ─── Timeline ───
    if (viewMode === "timeline" && config.timelineConfig) {
        const tc = config.timelineConfig;
        const items = filtered.map((r) => ({
            id: String(r.id ?? ""),
            label: String(r[tc.labelKey] ?? ""),
            sublabel: tc.sublabelKey ? String(r[tc.sublabelKey] ?? "") : undefined,
            startDate: String(r[tc.startDateKey] ?? ""),
            endDate: String(r[tc.endDateKey] ?? ""),
            progress: tc.progressKey ? Number(r[tc.progressKey] ?? 0) : undefined,
            color:
                tc.colorKey && tc.colorMap ? tc.colorMap[String(r[tc.colorKey] ?? "")] : undefined,
            group: tc.groupByKey ? String(r[tc.groupByKey] ?? "") : undefined,
        }));
        return (
            <DataTimeline
                data={items}
                actions={
                    renderRowActions
                        ? (item: { id: string }) =>
                              renderRowActions({ id: item.id } as EntityRecord)
                        : undefined
                }
                onItemClick={(item: { id: string }) => handleRowClick({ id: item.id })}
            />
        );
    }

    // ─── Calendar ───
    if (viewMode === "calendar" && config.calendarConfig) {
        const cc = config.calendarConfig;
        const items = filtered.map((r) => ({
            id: String(r.id ?? ""),
            title: String(r[cc.titleKey] ?? ""),
            date: String(r[cc.dateKey] ?? ""),
            endDate: cc.endDateKey ? String(r[cc.endDateKey] ?? "") : undefined,
            color:
                cc.colorKey && cc.colorMap ? cc.colorMap[String(r[cc.colorKey] ?? "")] : undefined,
        }));
        return (
            <DataCalendar
                data={items}
                actions={
                    renderRowActionItems
                        ? (item: { id: string }) =>
                              renderRowActionItems({ id: item.id } as EntityRecord)
                        : undefined
                }
                onItemClick={(item: { id: string }) => handleRowClick({ id: item.id })}
            />
        );
    }

    // ─── Gallery ───
    if (viewMode === "gallery" && config.galleryConfig) {
        const gc = config.galleryConfig;
        const items = filtered.map((r) => ({
            id: String(r.id ?? ""),
            imageUrl: r[gc.imageKey] ? String(r[gc.imageKey]) : undefined,
            title: String(r[gc.titleKey] ?? ""),
            subtitle: gc.subtitleKey ? String(r[gc.subtitleKey] ?? "") : undefined,
            status: gc.statusKey ? String(r[gc.statusKey] ?? "") : undefined,
        }));
        return (
            <DataGallery
                data={items}
                aspectRatio={gc.aspectRatio}
                actions={
                    renderRowActions
                        ? (item: { id: string }) =>
                              renderRowActions({ id: item.id } as EntityRecord)
                        : undefined
                }
                onItemClick={(item: { id: string }) => handleRowClick({ id: item.id })}
            />
        );
    }

    // ─── Chart ───
    if (viewMode === "chart" && config.chartConfig) {
        const ch = config.chartConfig;
        const buckets = new Map<string, number>();
        for (const r of filtered) {
            const cat = String(r[ch.categoryKey] ?? "Unknown");
            const val = ch.valueKey ? Number(r[ch.valueKey] ?? 0) : 1;
            const prev = buckets.get(cat) ?? 0;
            if (ch.aggregation === "sum" || !ch.aggregation) {
                buckets.set(cat, prev + val);
            } else if (ch.aggregation === "count") {
                buckets.set(cat, prev + 1);
            } else if (ch.aggregation === "avg") {
                buckets.set(cat, prev + val);
            }
        }
        let segments: { label: string; value: number; color: string }[];
        if (ch.aggregation === "avg") {
            const counts = new Map<string, number>();
            for (const r of filtered) {
                const cat = String(r[ch.categoryKey] ?? "Unknown");
                counts.set(cat, (counts.get(cat) ?? 0) + 1);
            }
            segments = Array.from(buckets.entries()).map(([label, sum], i) => ({
                label,
                value: Math.round((sum / (counts.get(label) ?? 1)) * 100) / 100,
                color: ch.colorMap?.[label] ?? getChartColor(i),
            }));
        } else {
            segments = Array.from(buckets.entries()).map(([label, value], i) => ({
                label,
                value,
                color: ch.colorMap?.[label] ?? getChartColor(i),
            }));
        }
        return <DataChart segments={segments} type={ch.type} />;
    }

    // ─── Map ───
    if (viewMode === "map" && config.mapConfig) {
        const mc = config.mapConfig;
        const items = filtered
            .filter((r) => r[mc.latKey] != null && r[mc.lngKey] != null)
            .map((r) => ({
                id: String(r.id ?? ""),
                lat: Number(r[mc.latKey]),
                lng: Number(r[mc.lngKey]),
                title: String(r[mc.titleKey] ?? ""),
                subtitle: mc.subtitleKey ? String(r[mc.subtitleKey] ?? "") : undefined,
                color:
                    mc.colorKey && mc.colorMap
                        ? mc.colorMap[String(r[mc.colorKey] ?? "")]
                        : undefined,
            }));
        return (
            <DataMap
                data={items}
                actions={
                    renderRowActionItems
                        ? (item: { id: string }) =>
                              renderRowActionItems({ id: item.id } as EntityRecord)
                        : undefined
                }
                onItemClick={(item: { id: string }) => handleRowClick({ id: item.id })}
            />
        );
    }

    // ─── Workload ───
    if (viewMode === "workload" && config.workloadConfig) {
        const wc = config.workloadConfig;
        const items = filtered.map((r) => ({
            id: String(r.id ?? ""),
            resource: String(r[wc.resourceKey] ?? ""),
            resourceAvatar: wc.resourceAvatarKey
                ? String(r[wc.resourceAvatarKey] ?? "") || undefined
                : undefined,
            startDate: String(r[wc.startDateKey] ?? ""),
            endDate: String(r[wc.endDateKey] ?? ""),
            hours: wc.hoursKey ? Number(r[wc.hoursKey] ?? 0) : undefined,
            category: wc.categoryKey ? String(r[wc.categoryKey] ?? "") : undefined,
            color:
                wc.categoryKey && wc.colorMap
                    ? wc.colorMap[String(r[wc.categoryKey] ?? "")]
                    : undefined,
        }));
        return (
            <DataWorkload
                data={items}
                capacityHoursPerDay={wc.capacityHoursPerDay}
                actions={
                    renderRowActions
                        ? (item: { id: string }) =>
                              renderRowActions({ id: item.id } as EntityRecord)
                        : undefined
                }
            />
        );
    }

    // Fallback: table
    return (
        <DataTable
            data={filtered}
            columns={dtColumns}
            keyField={"id" as keyof EntityRecord}
            searchable={false}
            onRowClick={handleRowClick}
            rowActions={renderRowActions}
            caption={`${title} list`}
        />
    );
});
