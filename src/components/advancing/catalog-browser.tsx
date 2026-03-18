"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Filter, Package, Search } from "lucide-react";
import {
    useCatalogCategories,
    useCatalogItems,
    useCatalogItemSearch,
} from "@/lib/supabase/hooks-advancing";
import { CategoryTypeBadge } from "./advance-status-badge";
import { CatalogItemCard } from "./catalog-item-card";
import { CATALOG_CATEGORY_TYPES } from "@/config/advancing-config";
import type { CatalogCategoryType } from "@/types";

interface CatalogBrowserProps {
    onAddItem: (item: {
        catalog_item_id: string;
        name: string;
        sku: string;
        unit_cost: number;
        thumbnail_url?: string;
        is_critical_path: boolean;
    }) => void;
    className?: string;
}

export function CatalogBrowser({ onAddItem, className }: CatalogBrowserProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
    const [breadcrumb, setBreadcrumb] = React.useState<{ id: string; name: string }[]>([]);
    const [showFilters, setShowFilters] = React.useState(false);
    const [categoryTypeFilter, setCategoryTypeFilter] = React.useState<CatalogCategoryType | "">(
        ""
    );

    const isSearching = searchQuery.length >= 2;

    // Fetch categories for current level
    const { data: categories, isLoading: categoriesLoading } = useCatalogCategories(
        selectedCategoryId ?? null
    );

    // Fetch items for current category (only when a category is selected)
    const { data: items, isLoading: itemsLoading } = useCatalogItems(
        selectedCategoryId
            ? { category_id: selectedCategoryId, sort_by: "sort_order", sort_order: "asc" }
            : undefined
    );

    // Full-text search
    const { data: searchResults, isLoading: searchLoading } = useCatalogItemSearch(searchQuery);

    const handleCategoryClick = (categoryId: string, categoryName: string) => {
        setSelectedCategoryId(categoryId);
        setBreadcrumb((prev) => [...prev, { id: categoryId, name: categoryName }]);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index < 0) {
            setSelectedCategoryId(null);
            setBreadcrumb([]);
        } else {
            const target = breadcrumb[index];
            if (target) {
                setSelectedCategoryId(target.id);
                setBreadcrumb((prev) => prev.slice(0, index + 1));
            }
        }
    };

    const filteredCategories = React.useMemo(() => {
        if (!categories) return [];
        if (!categoryTypeFilter) return categories as Record<string, unknown>[];
        return (categories as Record<string, unknown>[]).filter(
            (c) => c.category_type === categoryTypeFilter
        );
    }, [categories, categoryTypeFilter]);

    const displayItems = isSearching
        ? (searchResults as Record<string, unknown>[] | undefined)
        : (items as Record<string, unknown>[] | undefined);
    const isLoadingItems = isSearching ? searchLoading : itemsLoading;

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Search bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search catalog items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Search catalog items"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                        showFilters
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-accent"
                    )}
                    aria-expanded={showFilters}
                    aria-label="Toggle filters"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-3">
                    <select
                        value={categoryTypeFilter}
                        onChange={(e) =>
                            setCategoryTypeFilter(e.target.value as CatalogCategoryType | "")
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                        aria-label="Filter by category type"
                    >
                        <option value="">All Types</option>
                        {CATALOG_CATEGORY_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value}>
                                {ct.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Breadcrumb navigation */}
            {!isSearching && breadcrumb.length > 0 && (
                <nav aria-label="Category breadcrumb" className="flex items-center gap-1 text-sm">
                    <button
                        onClick={() => handleBreadcrumbClick(-1)}
                        className="text-primary hover:underline"
                    >
                        All Categories
                    </button>
                    {breadcrumb.map((crumb, index) => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <button
                                onClick={() => handleBreadcrumbClick(index)}
                                className={cn(
                                    index === breadcrumb.length - 1
                                        ? "font-medium text-foreground"
                                        : "text-primary hover:underline"
                                )}
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Category tiles */}
            {!isSearching && filteredCategories.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredCategories.map((category) => (
                        <button
                            key={category.id as string}
                            onClick={() =>
                                handleCategoryClick(category.id as string, category.name as string)
                            }
                            className="group flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
                        >
                            <div className="flex w-full items-center justify-between">
                                <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <span className="text-sm font-medium">{category.name as string}</span>
                            {!!category.category_type && (
                                <CategoryTypeBadge
                                    type={category.category_type as CatalogCategoryType}
                                />
                            )}
                            {typeof category.item_count === "number" &&
                                (category.item_count as number) > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {category.item_count as number} items
                                    </span>
                                )}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading state */}
            {(categoriesLoading || isLoadingItems) && (
                <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}

            {/* Items grid */}
            {displayItems && displayItems.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {displayItems.map((item) => (
                        <CatalogItemCard
                            key={item.id as string}
                            item={item}
                            onAddToCart={() =>
                                onAddItem({
                                    catalog_item_id: item.id as string,
                                    name: item.name as string,
                                    sku: item.sku as string,
                                    unit_cost: item.default_unit_cost as number,
                                    thumbnail_url: item.thumbnail_url as string | undefined,
                                    is_critical_path: (item.is_critical_path as boolean) ?? false,
                                })
                            }
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!categoriesLoading &&
                !isLoadingItems &&
                filteredCategories.length === 0 &&
                (!displayItems || displayItems.length === 0) && (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                        <Package className="h-10 w-10" />
                        <p className="text-sm">
                            {isSearching
                                ? "No items match your search"
                                : "No items in this category"}
                        </p>
                    </div>
                )}
        </div>
    );
}
