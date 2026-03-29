"use client";

/* ═══════════════════════════════════════════════════════════════
   LIST PAGE VIEW CONTENT — Data view renderer for ListPageShell

   Renders the appropriate data view (table, board, cards, timeline,
   calendar, gallery, chart, map, workload) based on the active view
   mode. Extracted from ListPageShell for maintainability.
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import dynamic from "next/dynamic";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { type ViewMode } from "@/components/ui/view-switcher";
import { AlertBanner } from "@/components/ui/alert-banner";
import { getChartColor } from "@/components/data-view/chart-colors";
import type { ListAlertDef, ListPageConfig } from "@/types/list-page-config";
import type { EntityRecord } from "@/types/entity";

// Performance: Alternate data views are dynamically imported — only loaded when user
// switches to that view mode. DataTable stays eager as the default view.
import type { DataBoardProps } from "@/components/data-view/data-board";
import type { DataCardsProps } from "@/components/data-view/data-cards";
import type { DataTimelineProps } from "@/components/data-view/data-timeline";
import type { DataCalendarProps } from "@/components/data-view/data-calendar";
import type { DataGalleryProps } from "@/components/data-view/data-gallery";
import type { DataMapProps } from "@/components/data-view/data-map";
import type { DataWorkloadProps } from "@/components/data-view/data-workload";

const DataBoard = dynamic(() =>
    import("@/components/data-view/data-board").then((m) => m.DataBoard)
) as unknown as React.ComponentType<DataBoardProps<EntityRecord>>;
const DataCards = dynamic(() =>
    import("@/components/data-view/data-cards").then((m) => m.DataCards)
) as unknown as React.ComponentType<DataCardsProps<EntityRecord>>;
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
);
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
    // ─── Table ───
    if (viewMode === "table") {
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
                data={filtered}
                columns={boardColumns}
                keyField={"id" as keyof EntityRecord}
                cardTitle={(bc.cardTitleKey ?? "name") as keyof EntityRecord}
                cardSubtitle={bc.cardSubtitleKey as keyof EntityRecord | undefined}
                cardFields={[]}
                actions={renderRowActions}
                onCardClick={handleRowClick}
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
