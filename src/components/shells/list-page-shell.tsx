"use client";

/* ═══════════════════════════════════════════════════════════════
   LIST PAGE SHELL — Universal composable list page container

   Composes Tier 1 primitives into a complete list page from a
   pure-data ListPageConfig. Supports table/board/cards views,
   declarative stats, filters, alerts, bulk actions, and create
   dialog. Slot overrides allow custom content injection.

   Replaces: EntityPageShell, hand-built PageShell list pages.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiList } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/layouts/loading-state";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { FilterBar } from "@/components/ui/filter-bar";
import { Tooltip } from "@/components/ui/tooltip";
import { type ViewMode, ViewSwitcher } from "@/components/ui/view-switcher";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import dynamic from "next/dynamic";
import { type ColumnDef } from "@/components/data-view/data-table";
import { RowActionsMenu } from "@/components/data-view/row-actions-menu";
import { ListAlertRenderer, ViewContent } from "@/components/shells/list-page-view-content";
import { PermissionGate } from "@/components/app/permission-guard";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CsvExportButton } from "@/components/csv/csv-export-button";
const CsvImportDialog = dynamic(() =>
    import("@/components/csv/csv-import-dialog").then((m) => m.CsvImportDialog)
);
import { QuickViewPanel } from "@/components/shells/quick-view-panel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnVisibilityPopover } from "@/components/ui/column-visibility-popover";
import {
    AdvancedFilterPopover,
    type FilterConjunction,
    type FilterFieldDef,
    type FilterGroup,
} from "@/components/ui/advanced-filter-popover";
import { useColumnPreferences } from "@/hooks/use-column-preferences";
import {
    CheckCircle2,
    Clock,
    Eye,
    Inbox,
    LayoutList,
    MoreVertical,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
} from "lucide-react";
import type { ListPageConfig, ListRowActionDef } from "@/types/list-page-config";
import {
    getResolvedConfig,
    type ListPageConfigKey,
    prefetchAllConfigs,
    resolveListPageConfig,
} from "@/config/list-page-configs/registry";
import { apiCreate, apiDelete, apiUpdate } from "@/lib/api/client";
import { humanizeSnakeCase } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { computeStatValue, matchesSearch, toDataTableColumn } from "@/lib/formatters/record-utils";
import { useEntityMeta } from "@/hooks/use-entity-meta";
import type { EntityRecord } from "@/types/entity";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Card, CardContent } from "@/components/ui/card";

export interface ListPageShellProps {
    /** Direct config object (client-side only — NOT serializable across RSC boundary) */
    config?: ListPageConfig | undefined;
    /** Registry key — serializable alternative to config for RSC→client boundary */
    configKey?: ListPageConfigKey | undefined;
    /** Pre-fetched data — bypasses built-in apiList query when provided */
    data?: EntityRecord[] | undefined;
    /** Loading state for externally-provided data */
    isLoading?: boolean | undefined;
    /** Children override — when provided, replaces the content area entirely.
     *  Absorbs the dashboard-style children pattern. */
    children?: React.ReactNode | undefined;
}

// ─── Outer wrapper: handles lazy config resolution ──────────

export function ListPageShell({
    config: configProp,
    configKey,
    data: externalData,
    isLoading: externalLoading,
    children,
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

    return (
        <ListPageShellInner config={config} data={externalData} isLoading={externalLoading}>
            {children}
        </ListPageShellInner>
    );
}

ListPageShell.displayName = "ListPageShell";

// ─── Inner component: all hooks + rendering ─────────────────

interface ListPageShellInnerProps {
    config: ListPageConfig;
    data?: Record<string, unknown>[] | undefined;
    isLoading?: boolean | undefined;
    children?: React.ReactNode | undefined;
}

function ListPageShellInner({
    config,
    data: externalData,
    isLoading: externalLoading,
    children,
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

    // Hydrate filter values — URL params take priority, then config defaultValues
    // Note: We use config.filters directly here (not resolvedFilters) because
    // resolvedFilters is a useMemo defined later and would cause a TDZ error.
    const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        // 1. Apply default values from filter definitions
        if (config.filters) {
            for (const f of config.filters) {
                if (f.defaultValue) {
                    initial[f.id] = f.defaultValue;
                }
            }
        }
        // 2. Override with URL search params (takes priority)
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
    // resource/action: config overrides take precedence (required for dashboard pages
    // that don't have a matching EntityConfig)
    const resource = config.resource ?? entityConfig?.resource ?? metaResource;
    const rbacAction = (config.action ?? "read") as "read" | "write" | "delete" | "manage";
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

    // ─── Tab state (URL-synced) ──────────────────────────────
    const hasTabs = Boolean(config.tabs && config.tabs.length > 0);
    const tabIds = useMemo(() => (config.tabs ?? []).map((t) => t.id), [config.tabs]);
    const [activeTab, setActiveTab] = useQueryTabState({
        defaultValue: config.tabs?.[0]?.id ?? "default",
        validValues: tabIds,
    });
    const tabItems = useMemo(() => {
        if (!config.tabs) return [];
        return config.tabs.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon ? React.createElement(t.icon, { className: "h-4 w-4" }) : undefined,
        }));
    }, [config.tabs]);

    // Dashboard-style: is this page using cardRenderer or children instead of DataTable?
    const isDashboardMode = Boolean(config.cardRenderer || children || config.contentSlot);

    // Search state: use external override if provided, else internal
    const effectiveSearch = config.searchState ? config.searchState.value : search;
    const effectiveSetSearch = config.searchState ? config.searchState.onValueChange : setSearch;
    const effectiveSearchPlaceholder =
        config.searchState?.placeholder ??
        config.searchPlaceholder ??
        `Search ${title.toLowerCase()}...`;

    // Smart defaults: auto-enable export/import when entity has a config
    const exportable = config.exportable ?? entityConfig != null;
    const importable = config.importable ?? entityConfig != null;

    // Cache invalidation helper (replaces window.location.reload)
    const invalidateEntity = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [config.entityKey] });
    }, [queryClient, config.entityKey]);

    // Fetch data via API (skipped when external data is provided)
    // Query key aligned with makeListHook pattern: [entityKey, filterParams]
    const {
        data: rawData,
        isLoading: apiLoading,
        isFetching,
    } = useQuery({
        queryKey: [config.entityKey, undefined],
        queryFn: async () => {
            const res = await apiList<EntityRecord>(basePath);
            return res.data;
        },
        enabled: externalData === undefined,
        // Performance: Keep previous list visible during navigation/refetch
        placeholderData: keepPreviousData,
        // Prevent refetch storms on rapid navigation — serve cached data for 30s
        staleTime: 30_000,
        // Retry transient Supabase errors (406/500) with default backoff
        retry: 2,
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

    // Compute stats — uses shared computeStatValue() for consistency with
    // DetailPageShell and the former dashboard shell.
    const computedStats = useMemo(() => {
        if (!config.stats) return null;
        return config.stats.map((s) => {
            // computeStatValue handles compute/value/accessorKey resolution.
            // ListStatDef also has a `filter` predicate — handle that here.
            let val: string | number;
            if (s.filter) {
                val = records.filter(s.filter).length;
            } else {
                val = computeStatValue(s, records);
            }
            return { label: s.label, icon: s.icon, computedValue: val };
        });
    }, [records, config.stats]);

    // Default stats when none configured (only for entity list pages, not dashboard mode)
    const defaultStats = useMemo(() => {
        if (config.stats || isDashboardMode) return null;
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
    }, [records, config.stats, isDashboardMode, title, Icon]);

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

    // ─── Unified field registry (table + card + board fields) ───
    // Collects all unique field IDs so useColumnPreferences tracks them
    // regardless of active view mode.
    const allDefaultFields = useMemo(() => {
        const seen = new Set<string>();
        const fields: { id: string; header: string; hidden?: boolean; sticky?: boolean }[] = [];

        // Table columns
        for (const c of dtColumns) {
            if (!seen.has(c.id)) {
                seen.add(c.id);
                fields.push({ id: c.id, header: c.header, hidden: !!c.hidden, sticky: !!c.sticky });
            }
        }

        // Card config fields
        if (config.cardConfig?.fields) {
            for (const f of config.cardConfig.fields) {
                if (!seen.has(f.id)) {
                    seen.add(f.id);
                    fields.push({ id: f.id, header: f.label ?? f.id });
                }
            }
        }

        return fields;
    }, [dtColumns, config.cardConfig]);

    // Column/field visibility + reorder preferences (persisted to localStorage)
    const columnPrefs = useColumnPreferences({
        entityKey: config.entityKey,
        defaultColumns: allDefaultFields.map((f) => ({
            id: f.id,
            hidden: !!f.hidden,
            sticky: !!f.sticky,
        })),
    });

    // Apply visibility + order to table columns
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

    // Build popover items from the unified field registry
    const colVisibilityItems = useMemo(
        () =>
            columnPrefs.order
                .map((id) => {
                    const field = allDefaultFields.find((f) => f.id === id);
                    if (!field) return null;
                    return {
                        id: field.id,
                        header: field.header,
                        visible: columnPrefs.visibility[field.id] !== false,
                        sticky: field.sticky,
                    };
                })
                .filter(Boolean) as {
                id: string;
                header: string;
                visible: boolean;
                sticky?: boolean | undefined;
            }[],
        [allDefaultFields, columnPrefs.order, columnPrefs.visibility]
    );

    // Label for the popover button: "Columns" for table, "Fields" for others
    const fieldPopoverLabel = viewMode === "table" ? "Columns" : "Fields";

    // Build Advanced Filter fields from resolvedFilters
    const advancedFilterFields = useMemo<FilterFieldDef[]>(() => {
        if (!resolvedFilters) return [];
        return resolvedFilters.map((f) => ({
            id: f.id,
            label: f.label,
            options: f.options.map((o) => ({ value: o.value, label: o.label })),
        }));
    }, [resolvedFilters]);

    // Advanced filter groups state
    const [advancedFilterGroups, setAdvancedFilterGroups] = useState<FilterGroup[]>([
        { conjunction: "and" as FilterConjunction, conditions: [] },
    ]);

    // Bridge: sync advanced filter conditions → existing filterValues state
    const handleFilterGroupsChange = useCallback(
        (groups: FilterGroup[]) => {
            setAdvancedFilterGroups(groups);
            // Convert conditions to the simple filterValues map
            // (first condition per field wins — "is" operator maps to equality)
            const next: Record<string, string> = {};
            for (const group of groups) {
                for (const cond of group.conditions) {
                    if (cond.value && cond.operator === "is") {
                        next[cond.fieldId] = cond.value;
                    }
                }
            }
            updateFilterValues(() => next);
        },
        [updateFilterValues]
    );

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

    // Non-table views handle their own empty states with contextual messaging
    // (e.g. "No data to chart", "No items with date ranges to display"),
    // so we always render ViewContent regardless of data length.

    // Empty state icon for dashboard-style rendering
    const EmptyIcon = config.emptyIcon ?? Inbox;

    return (
        <PermissionGate resource={resource} action={rbacAction}>
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
                        {config.headerActions}
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
                                    value={isLoading ? "—" : s.computedValue}
                                    icon={s.icon}
                                />
                            ))}
                        </StatsGrid>
                    ))}

                {/* Alerts */}
                {!isLoading &&
                    config.alerts?.map((alert, i) => (
                        <ListAlertRenderer key={i} alert={alert} records={records} />
                    ))}

                {/* After-stats slot */}
                {config.afterStatsSlot}

                {/* Toolbar — show search/filters/actions unless completely overridden */}
                {config.toolbarSlot ?? (
                    <FilterBar
                        search={{
                            value: effectiveSearch,
                            onValueChange: effectiveSetSearch,
                            placeholder: effectiveSearchPlaceholder,
                        }}
                        actions={
                            <>
                                {/* Dashboard-injected toolbar actions (left of built-in actions) */}
                                {config.toolbarActions}
                                {advancedFilterFields.length > 0 && (
                                    <AdvancedFilterPopover
                                        fields={advancedFilterFields}
                                        filterGroups={advancedFilterGroups}
                                        onFilterGroupsChange={handleFilterGroupsChange}
                                        activeCount={activeFilterCount}
                                    />
                                )}
                                {!isDashboardMode && colVisibilityItems.length > 1 && (
                                    <ColumnVisibilityPopover
                                        columns={colVisibilityItems}
                                        onToggle={columnPrefs.toggleVisibility}
                                        onReset={columnPrefs.reset}
                                        onShowAll={columnPrefs.showAll}
                                        onHideAll={columnPrefs.hideAll}
                                        onReorder={columnPrefs.reorder}
                                        label={fieldPopoverLabel}
                                    />
                                )}
                                {!isDashboardMode && hasMultiView && (
                                    <ViewSwitcher
                                        views={views}
                                        value={viewMode}
                                        onValueChange={setViewMode}
                                    />
                                )}
                                <Tooltip content="Refresh data" side="bottom">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={invalidateEntity}
                                        aria-label="Refresh data"
                                    >
                                        <RefreshCw
                                            className={cn(
                                                "h-4 w-4 transition-transform",
                                                isFetching && "motion-safe:animate-spin"
                                            )}
                                        />
                                    </Button>
                                </Tooltip>
                                {(importable || exportable) && (
                                    <DropdownMenu>
                                        <Tooltip content="More actions" side="bottom">
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    aria-label="More actions"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                        </Tooltip>
                                        <DropdownMenuContent align="end">
                                            {importable && (
                                                <DropdownMenuItem
                                                    onClick={() => setImportOpen(true)}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Import
                                                </DropdownMenuItem>
                                            )}
                                            {exportable && (
                                                <DropdownMenuItem>
                                                    <CsvExportButton
                                                        entity={config.entityKey}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-0 font-normal hover:bg-transparent"
                                                    />
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                {hasCreate && (
                                    <Button size="sm" onClick={openCreate}>
                                        <Plus className="h-4 w-4" />{" "}
                                        {config.createLabel ?? `New ${displayName}`}
                                    </Button>
                                )}
                            </>
                        }
                    />
                )}

                {/* Content — loading state for dashboard mode */}
                {isLoading && isDashboardMode ? (
                    <LoadingState />
                ) : config.contentSlot ? (
                    config.contentSlot
                ) : hasTabs && config.tabs ? (
                    /* ─── Tabbed content (dashboard mode) ─── */
                    <>
                        <TabBar
                            items={tabItems}
                            value={activeTab}
                            onValueChange={setActiveTab}
                            ariaLabel={`${title} tabs`}
                        />
                        {config.tabs.map((tab) => (
                            <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
                                {tab.content}
                            </TabPanel>
                        ))}
                    </>
                ) : children ? (
                    /* ─── Children override (dashboard mode) ─── */
                    children
                ) : config.cardRenderer ? (
                    /* ─── Card renderer (dashboard mode) ─── */
                    filtered.length > 0 ? (
                        <div
                            className={cn(
                                config.cardLayout === "grid"
                                    ? (config.gridCols ??
                                          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 density-gap-card")
                                    : "density-gap-section"
                            )}
                        >
                            {filtered.map((item, i) => (
                                <StaggerItem
                                    key={(item.id as string) ?? i}
                                    index={i}
                                    stagger="tight"
                                >
                                    {config.cardRenderer!(item, i)}
                                </StaggerItem>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                <EmptyIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <h3 className="text-sm font-semibold">
                                    {config.emptyTitle ?? "No data"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                    {config.emptyDescription ??
                                        "No records found matching your criteria."}
                                </p>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    /* ─── Standard entity list view (DataTable / Board / Cards / etc.) ─── */
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
                        fieldVisibility={columnPrefs.visibility}
                        fieldOrder={columnPrefs.order}
                        onBoardDragEnd={
                            config.boardConfig
                                ? async (itemId: string, _from: string, toColumn: string) => {
                                      try {
                                          await apiUpdate(basePath, itemId, {
                                              [config.boardConfig?.groupByKey ?? "status"]:
                                                  toColumn,
                                          });
                                          invalidateEntity();
                                      } catch {
                                          // API errors surface via toast
                                      }
                                  }
                                : undefined
                        }
                    />
                )}

                {/* After-cards slot */}
                {config.afterCardsSlot}

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
