"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE — ClickUp-Style Sortable, Filterable Table View
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldConfig, type FieldType } from "./field-renderers";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
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

// ─── Column Definition ───
export interface ColumnDef<T> {
    id: string;
    header: string;
    accessorKey?: keyof T;
    accessorFn?: (row: T) => unknown;
    fieldType?: FieldType;
    fieldConfig?: Partial<FieldConfig>;
    sortable?: boolean;
    filterable?: boolean;
    width?: string | number;
    minWidth?: number;
    align?: "left" | "center" | "right";
    sticky?: boolean;
    hidden?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
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
    operator?: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte";
}

// ─── Table Props ───
interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    keyField: keyof T;
    // Sorting
    sortable?: boolean;
    defaultSort?: SortState;
    onSortChange?: (sort: SortState | null) => void;
    // Filtering
    searchable?: boolean;
    searchPlaceholder?: string;
    filters?: FilterState[];
    onFiltersChange?: (filters: FilterState[]) => void;
    // Pagination
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    // Selection
    selectable?: boolean;
    selectedKeys?: Set<string>;
    onSelectionChange?: (keys: Set<string>) => void;
    // Row actions
    onRowClick?: (row: T) => void;
    rowActions?: (row: T) => React.ReactNode;
    // Styling
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
    stickyHeader?: boolean;
    className?: string;
    // Empty state
    emptyState?: React.ReactNode;
    // Loading
    loading?: boolean;
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
}: DataTableProps<T>) {
    // ─── State ───
    const [sort, setSort] = React.useState<SortState | null>(defaultSort ?? null);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(initialPageSize);
    const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<Set<string>>(new Set());

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
                    "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    column.sticky && "sticky left-0 bg-background z-10",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    canSort && "cursor-pointer select-none hover:text-foreground transition-colors"
                )}
                style={{ width: column.width, minWidth: column.minWidth }}
                onClick={canSort ? () => handleSort(column.id) : undefined}
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
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                        {selected.size > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                {selected.size} selected
                                <button onClick={() => setSelected(new Set())} className="ml-1">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {sortedData.length} {sortedData.length === 1 ? "item" : "items"}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full" role="table" aria-label="Data table">
                        <thead className={cn("bg-muted/50", stickyHeader && "sticky top-0 z-10")}>
                            <tr>
                                {selectable && (
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === paginatedData.length && paginatedData.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-input"
                                        />
                                    </th>
                                )}
                                {visibleColumns.map(renderHeaderCell)}
                                {rowActions && <th className="w-12 px-4 py-3" />}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                                        className="px-4 py-12 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                                        className="px-4 py-12 text-center"
                                    >
                                        {emptyState ?? (
                                            <div className="text-muted-foreground">
                                                {search ? "No results found" : "No data available"}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIndex) => {
                                    const key = String(row[keyField]);
                                    const isSelected = selected.has(key);

                                    return (
                                        <tr
                                            key={key}
                                            className={cn(
                                                "transition-colors",
                                                striped && rowIndex % 2 === 1 && "bg-muted/30",
                                                hoverable && "hover:bg-muted/50",
                                                isSelected && "bg-primary/5",
                                                onRowClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                            )}
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
                                                <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                                                        compact ? "px-4 py-2" : "px-4 py-3",
                                                        column.sticky && "sticky left-0 bg-background",
                                                        column.align === "center" && "text-center",
                                                        column.align === "right" && "text-right"
                                                    )}
                                                    style={{ width: column.width, minWidth: column.minWidth }}
                                                >
                                                    {renderCell(row, column)}
                                                </td>
                                            ))}
                                            {rowActions && (
                                                <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    {rowActions(row)}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
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
                        <span className="text-sm text-muted-foreground">
                            Page {page + 1} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(0)}
                                disabled={page === 0}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                                <span className="sr-only">First page</span>
                            </Button>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
