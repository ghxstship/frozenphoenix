"use client";

import * as React from "react";
import { Package, Plus } from "lucide-react";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/layouts/empty-state";
import { CategoryTypeBadge } from "@/components/advancing/advance-status-badge";
import { useCatalogCategories, useCatalogItems } from "@/lib/supabase/hooks-advancing";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { CatalogCategoryType } from "@/types";

const VIEW_OPTIONS = [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
] as const;

export default function CatalogAdminPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "grid",
        validValues: ["grid", "list"],
    });
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    const { data: categories, isLoading: catLoading } = useCatalogCategories();
    const { data: items, isLoading: itemsLoading } = useCatalogItems(
        selectedCategory ? { category_id: selectedCategory } : undefined
    );

    const catList = React.useMemo(
        () => (categories as Record<string, unknown>[] | undefined) ?? [],
        [categories]
    );
    const itemList = React.useMemo(
        () => (items as Record<string, unknown>[] | undefined) ?? [],
        [items]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return itemList;
        const q = searchQuery.toLowerCase();
        return itemList.filter((i) => {
            const name = String(i.name ?? "").toLowerCase();
            const sku = String(i.sku ?? "").toLowerCase();
            return name.includes(q) || sku.includes(q);
        });
    }, [itemList, searchQuery]);

    const isLoading = catLoading || itemsLoading;

    return (
        <PermissionGate resource="advancing" action="manage">
            <PageShell
                title="Catalog Management"
                description="Manage catalog categories and items"
                actions={
                    <Button disabled>
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                }
            >
                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Categories
                    </Button>
                    {catList.map((cat) => (
                        <Button
                            key={cat.id as string}
                            variant={selectedCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id as string)}
                        >
                            {String(cat.name)}
                        </Button>
                    ))}
                </div>

                {/* Search + view toggle */}
                <div className="flex items-center gap-3">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search items by name or SKU..."
                        className="max-w-sm flex-1"
                    />
                    <SegmentedControl
                        value={view}
                        onValueChange={setView}
                        options={[...VIEW_OPTIONS]}
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{catList.length} categories</span>
                    <span>&middot;</span>
                    <span>{filtered.length} items</span>
                </div>

                {/* Items */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No catalog items"
                        description="Add items to the catalog to get started"
                    />
                ) : view === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((item) => (
                            <Card key={item.id as string}>
                                <CardContent className="flex flex-col gap-2 pt-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium line-clamp-1">
                                                {String(item.name)}
                                            </h3>
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {String(item.sku)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={item.is_active ? "success" : "secondary"}
                                            className="text-[10px]"
                                        >
                                            {item.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    {Boolean(item.catalog_categories) && (
                                        <CategoryTypeBadge
                                            type={
                                                (item.catalog_categories as Record<string, unknown>)
                                                    ?.category_type as CatalogCategoryType
                                            }
                                        />
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {String(item.unit_of_measure ?? "ea")}
                                        </span>
                                        <span className="font-semibold">
                                            {formatAdvanceCost(Number(item.base_cost ?? 0))}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filtered.map((item) => (
                            <div
                                key={item.id as string}
                                className="flex items-center gap-4 rounded-md border px-4 py-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {String(item.name)}
                                        </span>
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {String(item.sku)}
                                        </span>
                                        <Badge
                                            variant={item.is_active ? "success" : "secondary"}
                                            className="text-[10px]"
                                        >
                                            {item.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-semibold">
                                    {formatAdvanceCost(Number(item.base_cost ?? 0))}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </PageShell>
        </PermissionGate>
    );
}
