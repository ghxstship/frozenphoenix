"use client";

/* ═══════════════════════════════════════════════════════════════
   LIST PAGE SHELL — Universal composable list page container

   Composes Tier 1 primitives into a complete list page from a
   pure-data ListPageConfig. Supports table/board/cards views,
   declarative stats, filters, alerts, bulk actions, and create
   dialog. Slot overrides allow custom content injection.

   Replaces: EntityPageShell, hand-built PageShell list pages.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { apiList } from "@/lib/api/client";
import { LoadingState } from "@/components/layouts/loading-state";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FilterBar } from "@/components/ui/filter-bar";
import { type ViewMode, ViewSwitcher } from "@/components/ui/view-switcher";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import dynamic from "next/dynamic";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { RowActionsMenu } from "@/components/data-view/row-actions-menu";

// Performance: Alternate data views are dynamically imported — only loaded when user
// switches to that view mode. DataTable stays eager as the default view.
// Saves ~200-400KB from the critical path JS bundle.
/* eslint-disable @typescript-eslint/no-explicit-any */
const DataBoard = dynamic(() =>
    import("@/components/data-view/data-board").then((m) => m.DataBoard)
) as React.ComponentType<any>;
const DataCards = dynamic(() =>
    import("@/components/data-view/data-cards").then((m) => m.DataCards)
) as React.ComponentType<any>;
const DataTimeline = dynamic(() =>
    import("@/components/data-view/data-timeline").then((m) => m.DataTimeline)
) as React.ComponentType<any>;
const DataCalendar = dynamic(() =>
    import("@/components/data-view/data-calendar").then((m) => m.DataCalendar)
) as React.ComponentType<any>;
const DataGallery = dynamic(() =>
    import("@/components/data-view/data-gallery").then((m) => m.DataGallery)
) as React.ComponentType<any>;
const DataChart = dynamic(() =>
    import("@/components/data-view/data-chart").then((m) => m.DataChart)
);
// getChartColor is a pure function — import from the tiny shared module
// instead of eagerly pulling in the full DataChart component.
import { getChartColor } from "@/components/data-view/chart-colors";
const DataMap = dynamic(() =>
    import("@/components/data-view/data-map").then((m) => m.DataMap)
) as React.ComponentType<any>;
const DataWorkload = dynamic(() =>
    import("@/components/data-view/data-workload").then((m) => m.DataWorkload)
) as React.ComponentType<any>;
/* eslint-enable @typescript-eslint/no-explicit-any */
import { PermissionGate } from "@/components/permission-guard";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { CsvImportDialog } from "@/components/csv/csv-import-dialog";
import { QuickViewPanel } from "@/components/shells/quick-view-panel";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ColumnVisibilityPopover } from "@/components/ui/column-visibility-popover";
import { useColumnPreferences } from "@/hooks/use-column-preferences";
import { CheckCircle2, Clock, Eye, LayoutList, Pencil, Plus, Trash2, Upload } from "lucide-react";
import type { ListAlertDef, ListPageConfig, ListRowActionDef } from "@/types/list-page-config";
import {
    getResolvedConfig,
    type ListPageConfigKey,
    prefetchAllConfigs,
    resolveListPageConfig,
} from "@/config/list-page-configs/registry";
import { apiCreate, apiDelete, apiUpdate } from "@/lib/api/client";
import { humanizeSnakeCase } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { matchesSearch, toDataTableColumn } from "@/lib/record-utils";
import { useEntityMeta } from "@/hooks/use-entity-meta";
import type { EntityRecord } from "@/types/entity";

export interface ListPageShellProps {
    /** Direct config object (client-side only — NOT serializable across RSC boundary) */
    config?: ListPageConfig;
    /** Registry key — serializable alternative to config for RSC→client boundary */
    configKey?: ListPageConfigKey;
    /** Pre-fetched data — bypasses built-in apiList query when provided */
    data?: EntityRecord[];
    /** Loading state for externally-provided data */
    isLoading?: boolean;
}

// ─── List Alert Renderer ─────────────────────────────────────

function ListAlertRenderer({ alert, records }: { alert: ListAlertDef; records: EntityRecord[] }) {
    if (!alert.when(records)) return null;
    const message = typeof alert.message === "function" ? alert.message(records) : alert.message;
    return <AlertBanner message={message} severity={alert.severity} icon={alert.icon} />;
}

// ─── View Content Renderer ──────────────────────────────────

interface ViewContentProps {
    viewMode: ViewMode;
    filtered: EntityRecord[];
    dtColumns: ColumnDef<EntityRecord>[];
    config: ListPageConfig;
    title: string;
    hasBulkActions: boolean;
    selectedKeys: Set<string>;
    setSelectedKeys: (keys: Set<string>) => void;
    handleRowClick: (record: EntityRecord) => void;
    renderRowActions?: (row: EntityRecord) => React.ReactNode;
    renderRowActionItems?: (row: EntityRecord) => React.ReactNode;
    onBoardDragEnd?: (itemId: string, fromColumn: string, toColumn: string) => void;
    emptyState?: React.ReactNode;
    isLoading?: boolean;
}

function ViewContent({
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
        // Derive unique column values from data
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
        const cardFields = (cc.fields ?? []).map((f) => ({
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
        return (
            <DataCards
                data={filtered}
                keyField={"id" as keyof EntityRecord}
                title={(cc.titleKey ?? "name") as keyof EntityRecord}
                subtitle={cc.subtitleKey as keyof EntityRecord | undefined}
                badge={cc.statusKey as keyof EntityRecord | undefined}
                fields={cardFields}
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
        // Aggregate data by categoryKey
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
                // For avg, store sum and count separately — finalize below
                buckets.set(cat, prev + val);
            }
        }
        // For avg, divide by count
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
}

// ─── Outer wrapper: handles lazy config resolution ──────────

export function ListPageShell({
    config: configProp,
    configKey,
    data: externalData,
    isLoading: externalLoading,
}: ListPageShellProps) {
    // Lazy config resolution: load only the needed module chunk on demand.
    // getResolvedConfig is synchronous (returns from cache if already loaded).
    const [lazyConfig, setLazyConfig] = useState<ListPageConfig | undefined>(
        configKey ? getResolvedConfig(configKey) : undefined
    );

    useEffect(() => {
        if (configProp || lazyConfig) return;
        if (!configKey) return;
        let cancelled = false;
        resolveListPageConfig(configKey).then((resolved) => {
            if (!cancelled) setLazyConfig(resolved);
            // Once the first config is loaded, prefetch remaining domain chunks
            // during browser idle time so all future navigations are instant.
            prefetchAllConfigs();
        });
        return () => {
            cancelled = true;
        };
    }, [configKey, configProp, lazyConfig]);

    // Also trigger prefetch if config was provided directly or from cache
    useEffect(() => {
        if (configProp || lazyConfig) prefetchAllConfigs();
    }, [configProp, lazyConfig]);

    const config = configProp ?? lazyConfig;

    if (!config) {
        if (configKey) return <LoadingState />;
        throw new Error(
            `ListPageShell: either "config" or a valid "configKey" is required. Received configKey="${String(configKey)}"`
        );
    }

    return <ListPageShellInner config={config} data={externalData} isLoading={externalLoading} />;
}

ListPageShell.displayName = "ListPageShell";

// ─── Inner component: all hooks + rendering ─────────────────

interface ListPageShellInnerProps {
    config: ListPageConfig;
    data?: Record<string, unknown>[];
    isLoading?: boolean;
}

function ListPageShellInner({
    config,
    data: externalData,
    isLoading: externalLoading,
}: ListPageShellInnerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const {
        entityConfig,
        resource: metaResource,
        basePath: metaBasePath,
        slug: metaSlug,
        displayName,
        displayNamePlural,
        searchColumns,
    } = useEntityMeta(config.entityKey);
    const [search, setSearch] = useState("");

    // Hydrate filter values from URL search params on mount
    const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (key.startsWith("filter.")) {
                initial[key.slice(7)] = value;
            }
        });
        return initial;
    });

    // Sync filter changes to URL
    const updateFilterValues = useCallback(
        (updater: (prev: Record<string, string>) => Record<string, string>) => {
            setFilterValues((prev) => {
                const next = updater(prev);
                // Build new URL params
                const params = new URLSearchParams(searchParams.toString());
                // Remove all existing filter.* params
                Array.from(params.keys())
                    .filter((k) => k.startsWith("filter."))
                    .forEach((k) => params.delete(k));
                // Add active filters
                for (const [id, val] of Object.entries(next)) {
                    if (val && val !== "all") {
                        params.set(`filter.${id}`, val);
                    }
                }
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
                return next;
            });
        },
        [searchParams, router, pathname]
    );

    const [viewMode, setViewMode] = useState<ViewMode>(config.defaultView ?? "table");
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [importOpen, setImportOpen] = useState(false);
    const [quickViewRecordId, setQuickViewRecordId] = useState<string | null>(null);

    // Resolve entity metadata
    const resource = entityConfig?.resource ?? metaResource;
    const title = config.title ?? displayNamePlural;
    const description = config.description ?? `Manage ${title.toLowerCase()}`;
    const basePath = entityConfig?.basePath ?? metaBasePath;
    const slug = entityConfig?.slug ?? metaSlug;
    const searchKeys = useMemo(
        () => config.searchKeys ?? searchColumns,
        [config.searchKeys, searchColumns]
    );
    const Icon = config.icon ?? LayoutList;
    const views = config.views ?? ["table"];

    // Smart defaults: auto-enable export/import when entity has a config
    const exportable = config.exportable ?? entityConfig != null;
    const importable = config.importable ?? entityConfig != null;

    // Cache invalidation helper (replaces window.location.reload)
    const invalidateEntity = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [config.entityKey] });
    }, [queryClient, config.entityKey]);

    // Fetch data via API (skipped when external data is provided)
    // Query key aligned with makeListHook pattern: [entityKey, filterParams]
    const { data: rawData, isLoading: apiLoading } = useQuery({
        queryKey: [config.entityKey, undefined],
        queryFn: async () => {
            const res = await apiList<EntityRecord>(basePath);
            return res.data;
        },
        enabled: externalData === undefined,
    });

    const isLoading = externalData !== undefined ? (externalLoading ?? false) : apiLoading;
    const records: EntityRecord[] = useMemo(
        () => externalData ?? rawData ?? [],
        [externalData, rawData]
    );

    // Auto-generate status filter when none configured
    const resolvedFilters = useMemo(() => {
        if (config.filters && config.filters.length > 0) return config.filters;
        // Derive a status filter from the data if records have a 'status' field
        if (records.length > 0 && records[0]?.status != null) {
            const uniqueStatuses = Array.from(
                new Set(records.map((r) => String(r.status ?? "")).filter(Boolean))
            ).sort();
            if (uniqueStatuses.length > 1 && uniqueStatuses.length <= 20) {
                return [
                    {
                        id: "status",
                        label: "Status",
                        column: "status",
                        options: uniqueStatuses.map((s) => ({
                            value: s,
                            label: humanizeSnakeCase(s),
                        })),
                    },
                ];
            }
        }
        return undefined;
    }, [config.filters, records]);

    // Apply search + filters
    const filtered = useMemo(() => {
        return records.filter((r) => {
            if (!matchesSearch(r, search, searchKeys)) return false;
            for (const [filterId, filterValue] of Object.entries(filterValues)) {
                if (filterValue === "all") continue;
                const filterDef = resolvedFilters?.find((f) => f.id === filterId);
                if (filterDef) {
                    const recordVal = String(r[filterDef.column] ?? "");
                    if (recordVal !== filterValue) return false;
                }
            }
            return true;
        });
    }, [records, search, searchKeys, filterValues, resolvedFilters]);

    // Compute stats
    const computedStats = useMemo(() => {
        if (!config.stats) return null;
        return config.stats.map((s) => {
            let val: string | number = records.length;
            if (s.value != null) val = s.value;
            else if (s.compute) val = s.compute(records);
            else if (s.filter) val = records.filter(s.filter).length;
            return { label: s.label, icon: s.icon, computedValue: val };
        });
    }, [records, config.stats]);

    // Default stats when none configured
    const defaultStats = useMemo(() => {
        if (config.stats) return null;
        const recentCutoff = new Date();
        recentCutoff.setDate(recentCutoff.getDate() - 30);
        const recentTs = recentCutoff.getTime();
        const activeCount = records.filter((r) => {
            const s = String(r.status ?? "");
            return s === "active" || s === "approved" || s === "in_progress" || s === "open";
        }).length;
        const recentCount = records.filter((r) => {
            const d = r.created_at;
            return typeof d === "string" && new Date(d).getTime() > recentTs;
        }).length;
        return [
            { label: `Total ${title}`, icon: Icon, computedValue: records.length },
            { label: "Active", icon: CheckCircle2, computedValue: activeCount },
            { label: "Recent (30d)", icon: Clock, computedValue: recentCount },
        ];
    }, [records, config.stats, title, Icon]);

    const statsToRender = computedStats ?? defaultStats;

    // Build DataTable columns
    const dtColumns = useMemo((): ColumnDef<EntityRecord>[] => {
        if (config.columns) return config.columns.map(toDataTableColumn);
        // Default columns from searchKeys
        const cols: ColumnDef<EntityRecord>[] = [
            {
                id: searchKeys[0] ?? "name",
                header: title,
                accessorKey: (searchKeys[0] ?? "name") as keyof EntityRecord,
                sortable: true,
            },
        ];
        const secondKey = searchKeys[1];
        if (secondKey) {
            cols.push({
                id: secondKey,
                header: secondKey.replace(/_/g, " "),
                accessorKey: secondKey as keyof EntityRecord,
            });
        }
        cols.push({
            id: "status",
            header: "Status",
            accessorKey: "status" as keyof EntityRecord,
            fieldType: "status",
        });
        cols.push({
            id: "created_at",
            header: "Created",
            accessorKey: "created_at" as keyof EntityRecord,
            fieldType: "date",
        });
        return cols;
    }, [config.columns, searchKeys, title]);

    // Column visibility + reorder preferences (persisted to localStorage)
    const columnPrefs = useColumnPreferences({
        entityKey: config.entityKey,
        defaultColumns: dtColumns.map((c) => ({ id: c.id, hidden: c.hidden, sticky: c.sticky })),
    });

    // Apply visibility + order to columns
    const orderedVisibleColumns = useMemo((): ColumnDef<EntityRecord>[] => {
        const colMap = new Map(dtColumns.map((c) => [c.id, c]));
        const ordered: ColumnDef<EntityRecord>[] = [];
        for (const id of columnPrefs.order) {
            const col = colMap.get(id);
            if (col && columnPrefs.visibility[id] !== false) {
                ordered.push(col);
            }
        }
        // Append any columns not in the order (new columns added after prefs were saved)
        for (const col of dtColumns) {
            if (!columnPrefs.order.includes(col.id) && columnPrefs.visibility[col.id] !== false) {
                ordered.push(col);
            }
        }
        return ordered;
    }, [dtColumns, columnPrefs.visibility, columnPrefs.order]);

    // Column visibility popover items
    const colVisibilityItems = useMemo(
        () =>
            columnPrefs.order
                .map((id) => {
                    const col = dtColumns.find((c) => c.id === id);
                    if (!col) return null;
                    return {
                        id: col.id,
                        header: col.header,
                        visible: columnPrefs.visibility[col.id] !== false,
                        sticky: col.sticky,
                    };
                })
                .filter(Boolean) as {
                id: string;
                header: string;
                visible: boolean;
                sticky?: boolean;
            }[],
        [dtColumns, columnPrefs.order, columnPrefs.visibility]
    );

    // Build FilterBar props
    const filterBarFilters = useMemo(() => {
        if (!resolvedFilters) return undefined;
        return resolvedFilters.map((f) => ({
            id: f.id,
            label: f.label,
            value: filterValues[f.id] ?? "all",
            options: f.options.map((o) => ({ value: o.value, label: o.label })),
            onValueChange: (val: string) => updateFilterValues((prev) => ({ ...prev, [f.id]: val })),
        }));
    }, [resolvedFilters, filterValues, updateFilterValues]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filterValues).filter((v) => v !== "all").length;
    }, [filterValues]);

    const handleRowClick = useCallback(
        (record: EntityRecord) => {
            if (!record.id) return;
            if (config.quickViewConfig) {
                setQuickViewRecordId(String(record.id));
            } else {
                router.push(`/${slug}/${String(record.id)}`);
            }
        },
        [router, slug, config.quickViewConfig]
    );

    // Record IDs for quick view prev/next navigation
    const filteredRecordIds = useMemo(() => {
        if (!config.quickViewConfig?.navigable) return undefined;
        return filtered.map((r) => String(r.id ?? "")).filter(Boolean);
    }, [filtered, config.quickViewConfig?.navigable]);

    const handleClearSelection = useCallback(() => {
        setSelectedKeys(new Set());
    }, []);

    // ─── Confirm Dialog ───────────────────────────────────────
    const { confirm } = useConfirm();

    // ─── Row Actions ─────────────────────────────────────────
    const defaultRowActions = useMemo<ListRowActionDef[]>(
        () => [
            {
                id: "view",
                label: "View Details",
                icon: Eye,
                onExecute: (record) => {
                    if (record.id) router.push(`/${slug}/${String(record.id)}`);
                },
            },
            {
                id: "edit",
                label: "Edit",
                icon: Pencil,
                onExecute: (record) => {
                    if (record.id) router.push(`/${slug}/${String(record.id)}/edit`);
                },
            },
            {
                id: "delete",
                label: "Delete",
                icon: Trash2,
                variant: "destructive",
                onExecute: async (record) => {
                    if (!record.id) return;
                    const confirmed = await confirm({
                        title: `Delete ${displayName}`,
                        description: `Are you sure you want to delete this ${displayName}? This action cannot be undone.`,
                        confirmLabel: "Delete",
                        variant: "destructive",
                    });
                    if (!confirmed) return;
                    try {
                        await apiDelete(basePath, String(record.id));
                        invalidateEntity();
                    } catch {
                        // API errors surface via toast in production
                    }
                },
            },
        ],
        [router, slug, basePath, displayName, confirm, invalidateEntity]
    );

    const resolvedRowActions = useMemo<ListRowActionDef[]>(() => {
        if (config.rowActions) return config.rowActions;
        return defaultRowActions;
    }, [config.rowActions, defaultRowActions]);

    const renderRowActions = useCallback(
        (row: EntityRecord) => <RowActionsMenu record={row} actions={resolvedRowActions} />,
        [resolvedRowActions]
    );

    // Render action items as raw DropdownMenuItem elements (for Calendar/Map
    // where the parent component already provides the DropdownMenu shell)
    const renderRowActionItems = useCallback(
        (row: EntityRecord) => {
            const defaultActions = resolvedRowActions.filter((a) => a.variant !== "destructive");
            const destructiveActions = resolvedRowActions.filter(
                (a) => a.variant === "destructive"
            );
            return (
                <>
                    {defaultActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <DropdownMenuItem key={action.id} onClick={() => action.onExecute(row)}>
                                {Icon && <Icon className="h-4 w-4 mr-2" />}
                                {action.label}
                            </DropdownMenuItem>
                        );
                    })}
                    {defaultActions.length > 0 && destructiveActions.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    {destructiveActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <DropdownMenuItem
                                key={action.id}
                                className="text-destructive"
                                onClick={() => action.onExecute(row)}
                            >
                                {Icon && <Icon className="h-4 w-4 mr-2" />}
                                {action.label}
                            </DropdownMenuItem>
                        );
                    })}
                </>
            );
        },
        [resolvedRowActions]
    );

    const hasCreate = !!config.createConfig;

    // Default bulk actions: Bulk Delete (auto-provided when no custom bulk actions configured)
    const resolvedBulkActions = useMemo(() => {
        if (config.bulkActions && config.bulkActions.length > 0) return config.bulkActions;
        return [
            {
                id: "bulk-delete",
                label: "Delete Selected",
                icon: Trash2,
                variant: "destructive" as const,
                onExecute: async (selectedIds: string[]) => {
                    const count = selectedIds.length;
                    const name = displayName;
                    const plural = displayNamePlural;
                    const confirmed = await confirm({
                        title: `Delete ${count} ${count === 1 ? name : plural}`,
                        description: `Are you sure you want to delete ${count} ${count === 1 ? name : plural}? This action cannot be undone.`,
                        confirmLabel: "Delete All",
                        variant: "destructive",
                    });
                    if (!confirmed) return;
                    try {
                        await Promise.all(selectedIds.map((id) => apiDelete(basePath, id)));
                        setSelectedKeys(new Set());
                        invalidateEntity();
                    } catch {
                        // API errors surface via toast in production
                    }
                },
            },
        ];
    }, [config.bulkActions, displayName, displayNamePlural, basePath, confirm, invalidateEntity]);

    const hasBulkActions = resolvedBulkActions.length > 0;
    const hasMultiView = views.length > 1;

    // Compact empty text for table view (column headers stay visible)
    const tableEmptyText = useMemo(() => {
        if (search || activeFilterCount > 0) {
            return `No ${title.toLowerCase()} match your filters`;
        }
        return config.emptyTitle ?? `No ${title.toLowerCase()} yet`;
    }, [search, activeFilterCount, title, config.emptyTitle]);

    // Non-table views still use the hero EmptyState as a wrapper
    const showNonTableEmpty = !isLoading && filtered.length === 0 && viewMode !== "table";

    return (
        <PermissionGate resource={resource} action="read">
            <div
                className="motion-safe:animate-fade-in"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--density-page-gap)",
                }}
            >
                {/* Header */}
                {config.headerSlot ?? (
                    <PageHeader title={title} description={description}>
                        {importable && (
                            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
                                <Upload className="h-4 w-4" /> Import
                            </Button>
                        )}
                        {exportable && (
                            <CsvExportButton
                                entity={config.entityKey}
                                size="sm"
                                variant="outline"
                            />
                        )}
                        {hasCreate && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4" />{" "}
                                {config.createLabel ?? `New ${displayName}`}
                            </Button>
                        )}
                    </PageHeader>
                )}

                {/* Stats */}
                {config.statsSlot ??
                    (statsToRender && statsToRender.length > 0 && (
                        <StatsGrid>
                            {statsToRender.map((s) => (
                                <StatCard
                                    key={s.label}
                                    title={s.label}
                                    value={s.computedValue}
                                    icon={s.icon}
                                />
                            ))}
                        </StatsGrid>
                    ))}

                {/* Alerts */}
                {config.alerts?.map((alert, i) => (
                    <ListAlertRenderer key={i} alert={alert} records={records} />
                ))}

                {/* Toolbar */}
                {config.toolbarSlot ?? (
                    <FilterBar
                        search={{
                            value: search,
                            onValueChange: setSearch,
                            placeholder: `Search ${title.toLowerCase()}...`,
                        }}
                        filters={filterBarFilters}
                        activeCount={activeFilterCount}
                        onClearAll={() => updateFilterValues(() => ({}))}
                        actions={
                            <>
                                {viewMode === "table" && colVisibilityItems.length > 1 && (
                                    <ColumnVisibilityPopover
                                        columns={colVisibilityItems}
                                        onToggle={columnPrefs.toggleVisibility}
                                        onReset={columnPrefs.reset}
                                        onShowAll={columnPrefs.showAll}
                                        onHideAll={columnPrefs.hideAll}
                                    />
                                )}
                                {hasMultiView && (
                                    <ViewSwitcher
                                        views={views}
                                        value={viewMode}
                                        onValueChange={setViewMode}
                                    />
                                )}
                            </>
                        }
                    />
                )}

                {/* Content */}
                {config.contentSlot ??
                    (showNonTableEmpty ? (
                        <EmptyState
                            icon={Icon}
                            title={config.emptyTitle ?? `No ${title.toLowerCase()} found`}
                            description={
                                search || activeFilterCount > 0
                                    ? "Try adjusting your search or filters"
                                    : (config.emptyDescription ??
                                      `Create your first ${entityConfig?.displayName?.toLowerCase() ?? "record"}`)
                            }
                            action={
                                !search && activeFilterCount === 0 && hasCreate
                                    ? {
                                          label:
                                              config.createLabel ??
                                              `New ${entityConfig?.displayName ?? "Record"}`,
                                          onClick: openCreate,
                                      }
                                    : undefined
                            }
                        />
                    ) : (
                        <ViewContent
                            viewMode={viewMode}
                            filtered={filtered}
                            dtColumns={orderedVisibleColumns}
                            config={config}
                            title={title}
                            hasBulkActions={hasBulkActions}
                            selectedKeys={selectedKeys}
                            setSelectedKeys={setSelectedKeys}
                            handleRowClick={handleRowClick}
                            renderRowActions={renderRowActions}
                            renderRowActionItems={renderRowActionItems}
                            emptyState={tableEmptyText}
                            isLoading={isLoading}
                            onBoardDragEnd={
                                config.boardConfig
                                    ? async (itemId: string, _from: string, toColumn: string) => {
                                          try {
                                              await apiUpdate(basePath, itemId, {
                                                  [config.boardConfig!.groupByKey]: toColumn,
                                              });
                                              invalidateEntity();
                                          } catch {
                                              // API errors surface via toast
                                          }
                                      }
                                    : undefined
                            }
                        />
                    ))}

                {/* Footer slot */}
                {config.footerSlot}

                {/* Bulk Action Bar */}
                {hasBulkActions && (
                    <BulkActionBar
                        selectedCount={selectedKeys.size}
                        actions={resolvedBulkActions}
                        selectedIds={Array.from(selectedKeys)}
                        onClearSelection={handleClearSelection}
                    />
                )}
            </div>

            {/* Create dialog */}
            {config.createConfig && (
                <CreateEntityDialog
                    config={config.createConfig}
                    open={createOpen}
                    onClose={closeCreate}
                    onSubmit={async (values) => {
                        await apiCreate(basePath, values);
                        invalidateEntity();
                    }}
                />
            )}

            {/* Import dialog */}
            {importable && (
                <CsvImportDialog
                    open={importOpen}
                    onOpenChange={setImportOpen}
                    entity={config.entityKey}
                />
            )}

            {/* Quick view panel */}
            {config.quickViewConfig && (
                <QuickViewPanel
                    open={quickViewRecordId !== null}
                    onClose={() => setQuickViewRecordId(null)}
                    config={config.quickViewConfig}
                    entityKey={config.entityKey}
                    recordId={quickViewRecordId}
                    titleKey={config.quickViewConfig.previewFields[0]?.accessorKey ?? "name"}
                    statusKey="status"
                    rowActions={resolvedRowActions}
                    recordIds={filteredRecordIds}
                    onNavigate={setQuickViewRecordId}
                    icon={config.icon}
                />
            )}
        </PermissionGate>
    );
}
