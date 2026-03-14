"use client";

/* ═══════════════════════════════════════════════════════════════
   LIST PAGE SHELL — Universal composable list page container

   Composes Tier 1 primitives into a complete list page from a
   pure-data ListPageConfig. Supports table/board/cards views,
   declarative stats, filters, alerts, bulk actions, and create
   dialog. Slot overrides allow custom content injection.

   Replaces: EntityPageShell, hand-built PageShell list pages.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiList } from "@/lib/api/client";
import { getEntityConfig } from "@/lib/api/entity-config";
import { LoadingState } from "@/components/layouts/loading-state";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { type ViewMode, ViewSwitcher } from "@/components/ui/view-switcher";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { DataBoard } from "@/components/data-view/data-board";
import { DataCards } from "@/components/data-view/data-cards";
import { DataTimeline } from "@/components/data-view/data-timeline";
import { DataCalendar } from "@/components/data-view/data-calendar";
import { DataGallery } from "@/components/data-view/data-gallery";
import { DataChart, getChartColor } from "@/components/data-view/data-chart";
import { DataMap } from "@/components/data-view/data-map";
import { DataWorkload } from "@/components/data-view/data-workload";
import { PermissionGate } from "@/components/permission-guard";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { CsvImportDialog } from "@/components/csv/csv-import-dialog";
import { AlertCircle, CheckCircle2, Clock, LayoutList, Plus, Upload } from "lucide-react";
import type { ListAlertDef, ListColumnDef, ListPageConfig } from "@/types/list-page-config";

// ─── Types ───────────────────────────────────────────────────

type EntityRecord = Record<string, unknown>;

export interface ListPageShellProps {
    config: ListPageConfig;
    /** Pre-fetched data — bypasses built-in apiList query when provided */
    data?: EntityRecord[];
    /** Loading state for externally-provided data */
    isLoading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────

function getNestedValue(record: EntityRecord, key: string): unknown {
    const parts = key.split(".");
    let current: unknown = record;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as EntityRecord)[part];
    }
    return current;
}

function matchesSearch(record: EntityRecord, search: string, keys: string[]): boolean {
    if (!search) return true;
    const q = search.toLowerCase();
    return keys.some((key) => {
        const val = getNestedValue(record, key);
        return typeof val === "string" && val.toLowerCase().includes(q);
    });
}

function toDataTableColumn(col: ListColumnDef): ColumnDef<EntityRecord> {
    return {
        id: col.id,
        header: col.header,
        accessorKey: col.accessorKey as keyof EntityRecord | undefined,
        accessorFn: col.accessorFn,
        fieldType: col.fieldType,
        fieldConfig: col.fieldConfig,
        render: col.render,
        sortable: col.sortable,
        width: col.width,
        minWidth: col.minWidth,
        align: col.align,
        hidden: col.hidden,
        sticky: col.sticky,
    };
}

// ─── Alert Banner ────────────────────────────────────────────

function AlertBanner({ alert, records }: { alert: ListAlertDef; records: EntityRecord[] }) {
    if (!alert.when(records)) return null;
    const Icon = alert.icon ?? AlertCircle;
    const message = typeof alert.message === "function" ? alert.message(records) : alert.message;
    const colorMap = {
        warning: "border-warning/30 bg-warning/5 text-warning",
        info: "border-info/30 bg-info/5 text-info",
        destructive: "border-destructive/30 bg-destructive/5 text-destructive",
    };
    return (
        <Card className={colorMap[alert.severity]}>
            <CardContent className="py-3 flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{message}</p>
            </CardContent>
        </Card>
    );
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
                caption={`${title} list`}
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
                onCardClick={handleRowClick}
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
            <DataTimeline data={items} onItemClick={(item) => handleRowClick({ id: item.id })} />
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
            <DataCalendar data={items} onItemClick={(item) => handleRowClick({ id: item.id })} />
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
                onItemClick={(item) => handleRowClick({ id: item.id })}
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
        return <DataMap data={items} onItemClick={(item) => handleRowClick({ id: item.id })} />;
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
        return <DataWorkload data={items} capacityHoursPerDay={wc.capacityHoursPerDay} />;
    }

    // Fallback: table
    return (
        <DataTable
            data={filtered}
            columns={dtColumns}
            keyField={"id" as keyof EntityRecord}
            searchable={false}
            onRowClick={handleRowClick}
            caption={`${title} list`}
        />
    );
}

// ─── Main Component ─────────────────────────────────────────

export function ListPageShell({
    config,
    data: externalData,
    isLoading: externalLoading,
}: ListPageShellProps) {
    const router = useRouter();
    const entityConfig = getEntityConfig(config.entityKey);
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<ViewMode>(config.defaultView ?? "table");
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [importOpen, setImportOpen] = useState(false);

    // Resolve entity metadata
    const resource = entityConfig?.resource ?? config.entityKey;
    const title = config.title ?? entityConfig?.displayNamePlural ?? config.entityKey;
    const description = config.description ?? `Manage ${title.toLowerCase()}`;
    const basePath = entityConfig?.basePath ?? `/api/${config.entityKey.replace(/_/g, "-")}`;
    const slug = entityConfig?.slug ?? config.entityKey.replace(/_/g, "-");
    const searchKeys = useMemo(
        () => config.searchKeys ?? entityConfig?.searchColumns ?? ["name", "title"],
        [config.searchKeys, entityConfig?.searchColumns]
    );
    const Icon = config.icon ?? LayoutList;
    const views = config.views ?? ["table"];

    // Fetch data via API (skipped when external data is provided)
    const { data: rawData, isLoading: apiLoading } = useQuery({
        queryKey: [config.entityKey, "list"],
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

    // Apply search + filters
    const filtered = useMemo(() => {
        return records.filter((r) => {
            if (!matchesSearch(r, search, searchKeys)) return false;
            for (const [filterId, filterValue] of Object.entries(filterValues)) {
                if (filterValue === "all") continue;
                const filterDef = config.filters?.find((f) => f.id === filterId);
                if (filterDef) {
                    const recordVal = String(r[filterDef.column] ?? "");
                    if (recordVal !== filterValue) return false;
                }
            }
            return true;
        });
    }, [records, search, searchKeys, filterValues, config.filters]);

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

    // Build FilterBar props
    const filterBarFilters = useMemo(() => {
        if (!config.filters) return undefined;
        return config.filters.map((f) => ({
            id: f.id,
            label: f.label,
            value: filterValues[f.id] ?? "all",
            options: f.options.map((o) => ({ value: o.value, label: o.label })),
            onValueChange: (val: string) => setFilterValues((prev) => ({ ...prev, [f.id]: val })),
        }));
    }, [config.filters, filterValues]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filterValues).filter((v) => v !== "all").length;
    }, [filterValues]);

    const handleRowClick = useCallback(
        (record: EntityRecord) => {
            if (record.id) {
                router.push(`/${slug}/${String(record.id)}`);
            }
        },
        [router, slug]
    );

    const handleClearSelection = useCallback(() => {
        setSelectedKeys(new Set());
    }, []);

    const hasCreate = !!config.createConfig;
    const hasBulkActions = (config.bulkActions?.length ?? 0) > 0;
    const hasMultiView = views.length > 1;

    // Loading
    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource={resource} action="read">
            <div
                className="animate-fade-in"
                style={{ display: "flex", flexDirection: "column", gap: "var(--density-page-gap)" }}
            >
                {/* Header */}
                {config.headerSlot ?? (
                    <PageHeader title={title} description={description}>
                        {config.importable && (
                            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
                                <Upload className="h-4 w-4" /> Import
                            </Button>
                        )}
                        {config.exportable && (
                            <CsvExportButton
                                entity={config.entityKey}
                                size="sm"
                                variant="outline"
                            />
                        )}
                        {hasCreate && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4" />{" "}
                                {config.createLabel ??
                                    `New ${entityConfig?.displayName ?? config.entityKey}`}
                            </Button>
                        )}
                    </PageHeader>
                )}

                {/* Stats */}
                {config.statsSlot ??
                    (statsToRender && statsToRender.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {statsToRender.map((s) => (
                                <StatCard
                                    key={s.label}
                                    title={s.label}
                                    value={s.computedValue}
                                    icon={s.icon}
                                />
                            ))}
                        </div>
                    ))}

                {/* Alerts */}
                {config.alerts?.map((alert, i) => (
                    <AlertBanner key={i} alert={alert} records={records} />
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
                        onClearAll={() => setFilterValues({})}
                        actions={
                            hasMultiView ? (
                                <ViewSwitcher
                                    views={views}
                                    value={viewMode}
                                    onValueChange={setViewMode}
                                />
                            ) : undefined
                        }
                    />
                )}

                {/* Content */}
                {config.contentSlot ??
                    (filtered.length === 0 ? (
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
                            dtColumns={dtColumns}
                            config={config}
                            title={title}
                            hasBulkActions={hasBulkActions}
                            selectedKeys={selectedKeys}
                            setSelectedKeys={setSelectedKeys}
                            handleRowClick={handleRowClick}
                        />
                    ))}

                {/* Footer slot */}
                {config.footerSlot}

                {/* Bulk Action Bar */}
                {hasBulkActions && (
                    <BulkActionBar
                        selectedCount={selectedKeys.size}
                        actions={config.bulkActions!}
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
                />
            )}

            {/* Import dialog */}
            {config.importable && (
                <CsvImportDialog
                    open={importOpen}
                    onOpenChange={setImportOpen}
                    entity={config.entityKey}
                />
            )}
        </PermissionGate>
    );
}

ListPageShell.displayName = "ListPageShell";
