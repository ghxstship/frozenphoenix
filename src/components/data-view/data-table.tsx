"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE — ClickUp-Style Sortable, Filterable Table View
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { type FieldConfig, FieldRenderer, type FieldType } from "./field-renderers";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

// Performance: Virtualize tbody when row count exceeds this threshold.
// Below this, the DOM cost is negligible and virtualization adds overhead.
const VIRTUALIZE_THRESHOLD = 50;
const ESTIMATED_ROW_HEIGHT = 44;

// ─── Column Definition ───
export interface ColumnDef<T> {
    id: string;
    header: string;
    accessorKey?: keyof T | undefined;
    accessorFn?: ((row: T) => unknown) | undefined;
    fieldType?: FieldType | undefined;
    fieldConfig?: Partial<FieldConfig> | undefined;
    sortable?: boolean | undefined;
    filterable?: boolean | undefined;
    width?: string | number | undefined;
    minWidth?: number | undefined;
    align?: "left" | "center" | "right" | undefined;
    sticky?: boolean | undefined;
    hidden?: boolean | undefined;
    render?: ((value: unknown, row: T) => React.ReactNode) | undefined;
}

// ─── Sort State ───
export interface SortState {
    column: string;
    direction: "asc" | "desc";
}

// ─── Filter State ───
export interface FilterState {
    column: string;
    value: string;
    operator?:
        | "equals"
        | "contains"
        | "startsWith"
        | "endsWith"
        | "gt"
        | "lt"
        | "gte"
        | "lte"
        | undefined;
}

// ─── Table Props ───
interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    keyField: keyof T;
    // Sorting
    sortable?: boolean | undefined;
    defaultSort?: SortState | undefined;
    onSortChange?: ((sort: SortState | null) => void) | undefined;
    // Filtering
    searchable?: boolean | undefined;
    searchPlaceholder?: string | undefined;
    filters?: FilterState[] | undefined;
    onFiltersChange?: ((filters: FilterState[]) => void) | undefined;
    // Pagination
    pagination?: boolean | undefined;
    pageSize?: number | undefined;
    pageSizeOptions?: number[] | undefined;
    // Selection
    selectable?: boolean | undefined;
    selectedKeys?: Set<string> | undefined;
    onSelectionChange?: ((keys: Set<string>) => void) | undefined;
    // Row actions
    onRowClick?: ((row: T) => void) | undefined;
    rowActions?: ((row: T) => React.ReactNode) | undefined;
    // Styling
    striped?: boolean | undefined;
    hoverable?: boolean | undefined;
    compact?: boolean | undefined;
    stickyHeader?: boolean | undefined;
    className?: string | undefined;
    // Empty state
    emptyState?: React.ReactNode | undefined;
    // Loading
    loading?: boolean | undefined;
    loadingRows?: number | undefined;
    // Accessibility
    caption?: string | undefined;
    // Grouping
    groupBy?: keyof T | undefined;
    groupLabels?: Record<string, string> | undefined;
}

// ─── Virtualized / Non-Virtualized Row Renderer ───
// Extracted to keep the main DataTable component clean.
// Uses @tanstack/react-virtual when rows > VIRTUALIZE_THRESHOLD.
function NonGroupedRows<T extends object>({
    data,
    keyField,
    visibleColumns,
    selected,
    getCellValue: _getCellValue,
    renderCell,
    handleSelectRow,
    selectable,
    striped,
    hoverable,
    compact,
    onRowClick,
    rowActions,
}: {
    data: T[];
    keyField: keyof T;
    visibleColumns: ColumnDef<T>[];
    selected: Set<string>;
    getCellValue: (row: T, column: ColumnDef<T>) => unknown;
    renderCell: (row: T, column: ColumnDef<T>) => React.ReactNode;
    handleSelectRow: (key: string) => void;
    selectable: boolean;
    striped: boolean;
    hoverable: boolean;
    compact: boolean;
    onRowClick?: ((row: T) => void) | undefined;
    rowActions?: ((row: T) => React.ReactNode) | undefined;
}) {
    const parentRef = React.useRef<HTMLTableSectionElement>(null);
    const shouldVirtualize = data.length > VIRTUALIZE_THRESHOLD;

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () =>
            parentRef.current?.closest(".overflow-x-auto") as HTMLElement | null,
        estimateSize: () => ESTIMATED_ROW_HEIGHT,
        overscan: 10,
        enabled: shouldVirtualize,
    });

    const renderRow = (row: T, rowIndex: number, style?: React.CSSProperties) => {
        const key = String(row[keyField]);
        const isSelected = selected.has(key);

        return (
            <tr
                key={key}
                className={cn(
                    "transition-colors group/row",
                    striped && rowIndex % 2 === 1 && "bg-muted/30",
                    hoverable && "hover:bg-muted/50",
                    isSelected && "bg-primary/5",
                    onRowClick &&
                        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                )}
                style={style}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onRowClick) {
                        e.preventDefault();
                        onRowClick(row);
                    }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
            >
                {selectable && (
                    <td
                        className="w-12"
                        style={{
                            padding: "var(--density-table-py) var(--density-table-px)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            className="rounded border-input"
                        />
                    </td>
                )}
                {visibleColumns.map((column) => (
                    <td
                        key={column.id}
                        className={cn(
                            column.sticky && "sticky left-0 bg-background",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right"
                        )}
                        style={{
                            width: column.width,
                            minWidth: column.minWidth,
                            padding: compact
                                ? `calc(var(--density-table-py) * 0.67) var(--density-table-px)`
                                : "var(--density-table-py) var(--density-table-px)",
                        }}
                    >
                        {renderCell(row, column)}
                    </td>
                ))}
                {rowActions && (
                    <td
                        className="w-12"
                        style={{
                            padding: "var(--density-table-py) var(--density-table-px)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {rowActions(row)}
                    </td>
                )}
            </tr>
        );
    };

    if (!shouldVirtualize) {
        return <>{data.map((row, i) => renderRow(row, i))}</>;
    }

    // Virtualized: render spacer rows + visible rows
    const virtualRows = virtualizer.getVirtualItems();
    const totalHeight = virtualizer.getTotalSize();

    return (
        <>
            {totalHeight > 0 && virtualRows.length > 0 && virtualRows[0]!.start > 0 && (
                <tr aria-hidden="true">
                    <td style={{ height: virtualRows[0]!.start, padding: 0 }} />
                </tr>
            )}
            {virtualRows.map((virtualRow) => {
                const row = data[virtualRow.index]!;
                return renderRow(row, virtualRow.index);
            })}
            {totalHeight > 0 && virtualRows.length > 0 && (
                <tr aria-hidden="true">
                    <td
                        style={{
                            height: totalHeight - (virtualRows.at(-1)?.end ?? 0),
                            padding: 0,
                        }}
                    />
                </tr>
            )}
        </>
    );
}

export function DataTable<T extends object>({
    data,
    columns,
    keyField,
    sortable = true,
    defaultSort,
    onSortChange,
    searchable = true,
    searchPlaceholder = "Search...",
    pagination = true,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    selectable = false,
    selectedKeys,
    onSelectionChange,
    onRowClick,
    rowActions,
    striped = false,
    hoverable = true,
    compact = false,
    stickyHeader = true,
    className,
    emptyState,
    loading = false,
    loadingRows = 5,
    caption,
    groupBy,
    groupLabels,
}: DataTableProps<T>) {
    // ─── State ───
    const [sort, setSort] = React.useState<SortState | null>(defaultSort ?? null);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(initialPageSize);
    const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<Set<string>>(new Set());
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

    const selected = selectedKeys ?? internalSelectedKeys;
    const setSelected = onSelectionChange ?? setInternalSelectedKeys;

    // ─── Visible Columns ───
    const visibleColumns = columns.filter((col) => !col.hidden);

    // ─── Get Cell Value ───
    const getCellValue = React.useCallback((row: T, column: ColumnDef<T>): unknown => {
        if (column.accessorFn) return column.accessorFn(row);
        if (column.accessorKey) return row[column.accessorKey];
        return undefined;
    }, []);

    // ─── Filtered Data ───
    const filteredData = React.useMemo(() => {
        if (!search) return data;
        const searchLower = search.toLowerCase();
        return data.filter((row) =>
            visibleColumns.some((col) => {
                const value = getCellValue(row, col);
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchLower);
            })
        );
    }, [data, search, visibleColumns, getCellValue]);

    // ─── Sorted Data ───
    const sortedData = React.useMemo(() => {
        if (!sort) return filteredData;
        const column = columns.find((c) => c.id === sort.column);
        if (!column) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = getCellValue(a, column);
            const bVal = getCellValue(b, column);

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            let comparison = 0;
            if (typeof aVal === "number" && typeof bVal === "number") {
                comparison = aVal - bVal;
            } else if (typeof aVal === "string" && typeof bVal === "string") {
                comparison = aVal.localeCompare(bVal);
            } else if (aVal instanceof Date && bVal instanceof Date) {
                comparison = aVal.getTime() - bVal.getTime();
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }

            return sort.direction === "desc" ? -comparison : comparison;
        });
    }, [filteredData, sort, columns, getCellValue]);

    // ─── Paginated Data ───
    const paginatedData = React.useMemo(() => {
        if (!pagination) return sortedData;
        const start = page * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize, pagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // ─── Handlers ───
    const handleSort = (columnId: string) => {
        const newSort: SortState | null =
            sort?.column === columnId
                ? sort.direction === "asc"
                    ? { column: columnId, direction: "desc" }
                    : null
                : { column: columnId, direction: "asc" };
        setSort(newSort);
        onSortChange?.(newSort);
    };

    const handleSelectAll = () => {
        if (selected.size === paginatedData.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paginatedData.map((row) => String(row[keyField]))));
        }
    };

    const handleSelectRow = (key: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelected(newSelected);
    };

    // ─── Render Header Cell ───
    const renderHeaderCell = (column: ColumnDef<T>) => {
        const isSorted = sort?.column === column.id;
        const canSort = sortable && column.sortable !== false;

        return (
            <th
                key={column.id}
                className={cn(
                    "text-left text-xs font-semibold text-muted-foreground",
                    column.sticky && "sticky left-0 bg-background z-10",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    canSort && "cursor-pointer select-none hover:text-foreground transition-colors"
                )}
                style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    padding: "var(--density-table-py) var(--density-table-px)",
                }}
                onClick={canSort ? () => handleSort(column.id) : undefined}
                aria-sort={
                    isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined
                }
            >
                <div className="flex items-center gap-1.5">
                    <span>{column.header}</span>
                    {canSort && (
                        <span className="text-muted-foreground/50">
                            {isSorted ? (
                                sort.direction === "asc" ? (
                                    <ArrowUp className="h-3.5 w-3.5" />
                                ) : (
                                    <ArrowDown className="h-3.5 w-3.5" />
                                )
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5" />
                            )}
                        </span>
                    )}
                </div>
            </th>
        );
    };

    // ─── Render Cell ───
    const renderCell = (row: T, column: ColumnDef<T>) => {
        const value = getCellValue(row, column);

        if (column.render) {
            return column.render(value, row);
        }

        if (column.fieldType) {
            return (
                <FieldRenderer
                    value={value}
                    config={{ type: column.fieldType, ...column.fieldConfig }}
                />
            );
        }

        if (value == null) {
            return <span className="text-muted-foreground">—</span>;
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Toolbar */}
            {(searchable || selectable) && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        {searchable && (
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
                                    placeholder={searchPlaceholder}
                                    className="pl-9 h-9"
                                />
                                {search && (
                                    <Tooltip content="Clear search" side="bottom">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSearch("")}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                        {selected.size > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                {selected.size} selected
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelected(new Set())}
                                    className="h-4 w-4 ml-1 p-0"
                                    aria-label="Clear selection"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground tabular-nums">
                        {sortedData.length} {sortedData.length === 1 ? "item" : "items"}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table
                        className="w-full"
                        role="table"
                        aria-label={caption ?? "Data table"}
                        style={{ fontSize: "var(--density-table-font)" }}
                    >
                        {caption && <caption className="sr-only">{caption}</caption>}
                        <thead
                            className={cn(
                                "bg-muted/50 border-b border-border",
                                stickyHeader && "sticky top-0 z-10 backdrop-blur-sm bg-muted/80"
                            )}
                        >
                            <tr>
                                {selectable && (
                                    <th
                                        className="w-12"
                                        style={{
                                            padding:
                                                "var(--density-table-py) var(--density-table-px)",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                selected.size === paginatedData.length &&
                                                paginatedData.length > 0
                                            }
                                            onChange={handleSelectAll}
                                            className="rounded border-input"
                                        />
                                    </th>
                                )}
                                {visibleColumns.map(renderHeaderCell)}
                                {rowActions && (
                                    <th
                                        className="w-12"
                                        style={{
                                            padding:
                                                "var(--density-table-py) var(--density-table-px)",
                                        }}
                                    />
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: loadingRows }).map((_, rowIdx) => (
                                    <tr key={`skeleton-${rowIdx}`} aria-hidden="true">
                                        {selectable && (
                                            <td
                                                className="w-12"
                                                style={{
                                                    padding:
                                                        "var(--density-table-py) var(--density-table-px)",
                                                }}
                                            >
                                                <div className="h-4 w-4 rounded bg-muted motion-safe:animate-pulse" />
                                            </td>
                                        )}
                                        {visibleColumns.map((col) => (
                                            <td
                                                key={col.id}
                                                style={{
                                                    width: col.width,
                                                    minWidth: col.minWidth,
                                                    padding:
                                                        "var(--density-table-py) var(--density-table-px)",
                                                }}
                                            >
                                                <div
                                                    className="h-4 rounded bg-muted motion-safe:animate-pulse"
                                                    style={{
                                                        width: col.width
                                                            ? undefined
                                                            : `${55 + ((rowIdx * 17 + visibleColumns.indexOf(col) * 31) % 35)}%`,
                                                        animationDelay: `${rowIdx * 50 + visibleColumns.indexOf(col) * 30}ms`,
                                                    }}
                                                />
                                            </td>
                                        ))}
                                        {rowActions && (
                                            <td
                                                className="w-12"
                                                style={{
                                                    padding:
                                                        "var(--density-table-py) var(--density-table-px)",
                                                }}
                                            >
                                                <div className="h-4 w-6 rounded bg-muted motion-safe:animate-pulse" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            visibleColumns.length +
                                            (selectable ? 1 : 0) +
                                            (rowActions ? 1 : 0)
                                        }
                                        className="px-4 text-center"
                                        style={{
                                            padding:
                                                "var(--density-table-py) var(--density-table-px)",
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center py-10 gap-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {emptyState ??
                                                    (search
                                                        ? "No results found"
                                                        : "No data available")}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : groupBy ? (
                                (() => {
                                    // Group rows by the groupBy key
                                    const grouped = new Map<string, T[]>();
                                    for (const row of paginatedData) {
                                        const gv = String(row[groupBy] ?? "Ungrouped");
                                        if (!grouped.has(gv)) grouped.set(gv, []);
                                        grouped.get(gv)!.push(row);
                                    }
                                    return Array.from(grouped.entries()).map(
                                        ([groupValue, groupRows]) => {
                                            const isCollapsed = collapsedGroups.has(groupValue);
                                            const displayLabel =
                                                groupLabels?.[groupValue] ?? groupValue;
                                            return (
                                                <React.Fragment key={`group-${groupValue}`}>
                                                    <tr
                                                        className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                                        onClick={() => {
                                                            setCollapsedGroups((prev) => {
                                                                const next = new Set(prev);
                                                                if (next.has(groupValue))
                                                                    next.delete(groupValue);
                                                                else next.add(groupValue);
                                                                return next;
                                                            });
                                                        }}
                                                        role="button"
                                                        aria-expanded={!isCollapsed}
                                                    >
                                                        <td
                                                            colSpan={
                                                                visibleColumns.length +
                                                                (selectable ? 1 : 0) +
                                                                (rowActions ? 1 : 0)
                                                            }
                                                            style={{
                                                                padding:
                                                                    "var(--density-table-py) var(--density-table-px)",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ChevronDown
                                                                    className={cn(
                                                                        "h-4 w-4 transition-transform",
                                                                        isCollapsed && "-rotate-90"
                                                                    )}
                                                                />
                                                                <span className="text-xs font-semibold">
                                                                    {displayLabel}
                                                                </span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="density-caption h-4 px-1.5"
                                                                >
                                                                    {groupRows.length}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {!isCollapsed &&
                                                        groupRows.map((row, rowIndex) => {
                                                            const key = String(row[keyField]);
                                                            const isSelected = selected.has(key);
                                                            return (
                                                                <tr
                                                                    key={key}
                                                                    className={cn(
                                                                        "transition-colors group/row",
                                                                        striped &&
                                                                            rowIndex % 2 === 1 &&
                                                                            "bg-muted/30",
                                                                        hoverable &&
                                                                            "hover:bg-muted/50",
                                                                        isSelected &&
                                                                            "bg-primary/5",
                                                                        onRowClick &&
                                                                            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                                                    )}
                                                                    onClick={() =>
                                                                        onRowClick?.(row)
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (
                                                                            (e.key === "Enter" ||
                                                                                e.key === " ") &&
                                                                            onRowClick
                                                                        ) {
                                                                            e.preventDefault();
                                                                            onRowClick(row);
                                                                        }
                                                                    }}
                                                                    tabIndex={
                                                                        onRowClick ? 0 : undefined
                                                                    }
                                                                    role={
                                                                        onRowClick
                                                                            ? "button"
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {selectable && (
                                                                        <td
                                                                            className="w-12"
                                                                            style={{
                                                                                padding:
                                                                                    "var(--density-table-py) var(--density-table-px)",
                                                                            }}
                                                                            onClick={(e) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() =>
                                                                                    handleSelectRow(
                                                                                        key
                                                                                    )
                                                                                }
                                                                                className="rounded border-input"
                                                                            />
                                                                        </td>
                                                                    )}
                                                                    {visibleColumns.map(
                                                                        (column) => (
                                                                            <td
                                                                                key={column.id}
                                                                                className={cn(
                                                                                    column.sticky &&
                                                                                        "sticky left-0 bg-background",
                                                                                    column.align ===
                                                                                        "center" &&
                                                                                        "text-center",
                                                                                    column.align ===
                                                                                        "right" &&
                                                                                        "text-right"
                                                                                )}
                                                                                style={{
                                                                                    width: column.width,
                                                                                    minWidth:
                                                                                        column.minWidth,
                                                                                    padding: compact
                                                                                        ? `calc(var(--density-table-py) * 0.67) var(--density-table-px)`
                                                                                        : "var(--density-table-py) var(--density-table-px)",
                                                                                }}
                                                                            >
                                                                                {renderCell(
                                                                                    row,
                                                                                    column
                                                                                )}
                                                                            </td>
                                                                        )
                                                                    )}
                                                                    {rowActions && (
                                                                        <td
                                                                            className="w-12"
                                                                            style={{
                                                                                padding:
                                                                                    "var(--density-table-py) var(--density-table-px)",
                                                                            }}
                                                                            onClick={(e) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            {rowActions(row)}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })}
                                                </React.Fragment>
                                            );
                                        }
                                    );
                                })()
                            ) : (
                                <NonGroupedRows
                                    data={paginatedData}
                                    keyField={keyField}
                                    visibleColumns={visibleColumns}
                                    selected={selected}
                                    getCellValue={getCellValue}
                                    renderCell={renderCell}
                                    handleSelectRow={handleSelectRow}
                                    selectable={selectable}
                                    striped={striped}
                                    hoverable={hoverable}
                                    compact={compact}
                                    onRowClick={onRowClick}
                                    rowActions={rowActions}
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground tabular-nums">
                            Page {page + 1} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <Tooltip content="First page" side="top">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(0)}
                                    disabled={page === 0}
                                    className="h-8 w-8 p-0"
                                    aria-label="First page"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Previous page" side="top">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    className="h-8 w-8 p-0"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Next page" side="top">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="h-8 w-8 p-0"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Last page" side="top">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(totalPages - 1)}
                                    disabled={page >= totalPages - 1}
                                    className="h-8 w-8 p-0"
                                    aria-label="Last page"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

DataTable.displayName = "DataTable";
