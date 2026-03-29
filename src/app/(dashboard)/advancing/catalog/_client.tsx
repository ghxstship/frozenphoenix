"use client";

import * as React from "react";
import { ChevronRight, Package, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_CATALOG_ITEM_CONFIG } from "@/config/create-entity-configs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/layouts/empty-state";
import { CategoryTypeBadge } from "@/components/advancing/advance-status-badge";
import {
    buildCategoryTree,
    type CategoryNode,
    CategoryTree,
} from "@/components/advancing/category-tree";
import { useCatalogCategories, useCatalogItems } from "@/lib/supabase/hooks-advancing";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { CatalogCategoryType } from "@/types";

const VIEW_OPTIONS = [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────

function collectDescendantIds(node: CategoryNode): string[] {
    const ids = [node.id];
    for (const child of node.children) {
        ids.push(...collectDescendantIds(child));
    }
    return ids;
}

function findNodeById(roots: CategoryNode[], id: string): CategoryNode | null {
    for (const root of roots) {
        if (root.id === id) return root;
        const found = findNodeById(root.children, id);
        if (found) return found;
    }
    return null;
}

function buildBreadcrumb(
    roots: CategoryNode[],
    targetId: string,
    nodeMap: Map<string, CategoryNode>
): CategoryNode[] {
    const trail: CategoryNode[] = [];
    let current = nodeMap.get(targetId);
    while (current) {
        trail.unshift(current);
        current = current.parent_id ? nodeMap.get(current.parent_id) : undefined;
    }
    return trail;
}

function buildNodeMap(roots: CategoryNode[]): Map<string, CategoryNode> {
    const map = new Map<string, CategoryNode>();
    const visit = (node: CategoryNode) => {
        map.set(node.id, node);
        for (const child of node.children) visit(child);
    };
    for (const root of roots) visit(root);
    return map;
}

export function CatalogPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "grid",
        validValues: ["grid", "list"],
    });

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedCategory = searchParams.get("category") || null;

    const setSelectedCategory = React.useCallback(
        (id: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (id) {
                params.set("category", id);
            } else {
                params.delete("category");
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const { data: categories, isLoading: catLoading } = useCatalogCategories();
    const { data: items, isLoading: itemsLoading } = useCatalogItems();

    const catList = React.useMemo(
        () => (categories as Record<string, unknown>[] | undefined) ?? [],
        [categories]
    );
    const tree = React.useMemo(() => buildCategoryTree(catList), [catList]);
    const nodeMap = React.useMemo(() => buildNodeMap(tree), [tree]);

    const itemList = React.useMemo(
        () => (items as Record<string, unknown>[] | undefined) ?? [],
        [items]
    );

    const selectedNode = React.useMemo(
        () => (selectedCategory ? findNodeById(tree, selectedCategory) : null),
        [selectedCategory, tree]
    );
    const breadcrumb = selectedCategory ? buildBreadcrumb(tree, selectedCategory, nodeMap) : [];

    const allowedCategoryIds = React.useMemo<Set<string> | null>(() => {
        if (!selectedNode) return null;
        return new Set(collectDescendantIds(selectedNode));
    }, [selectedNode]);

    const filtered = React.useMemo(() => {
        let result = itemList;

        if (allowedCategoryIds) {
            result = result.filter((i) => allowedCategoryIds.has(i.category_id as string));
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((i) => {
                const name = String(i.name ?? "").toLowerCase();
                const sku = String(i.sku ?? "").toLowerCase();
                return name.includes(q) || sku.includes(q);
            });
        }

        return result;
    }, [itemList, allowedCategoryIds, searchQuery]);

    const isLoading = catLoading || itemsLoading;

    const contentSlot = (
        <div className="flex gap-6 min-h-0">
            {/* Sidebar: Category tree */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col border-r pr-4">
                <CategoryTree
                    categories={tree}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                    className="h-full overflow-y-auto"
                />
            </aside>

            {/* Main content area */}
            <div className="flex-1 min-w-0 density-gap-page">
                {/* Breadcrumb */}
                {breadcrumb.length > 0 && (
                    <nav
                        aria-label="Category breadcrumb"
                        className="flex items-center gap-1 text-sm"
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            All
                        </button>
                        {breadcrumb.map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight
                                    className="h-3.5 w-3.5 text-muted-foreground/50"
                                    aria-hidden="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory(crumb.id)}
                                    className={
                                        crumb.id === selectedCategory
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground hover:text-foreground transition-colors"
                                    }
                                >
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Search + view toggle + stats */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                        {filtered.length} {filtered.length === 1 ? "item" : "items"}
                    </span>
                </div>

                {/* Mobile category selector (visible below md) */}
                <div className="md:hidden">
                    <CategoryTree
                        categories={tree}
                        selectedId={selectedCategory}
                        onSelect={setSelectedCategory}
                        className="max-h-48 overflow-y-auto rounded-md border p-2"
                    />
                </div>

                {/* Items */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 motion-safe:animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No catalog items"
                        description={
                            selectedNode
                                ? `No items in ${selectedNode.name}. Try selecting a parent category or clearing your search.`
                                : "Add items to the catalog to get started"
                        }
                    />
                ) : view === "grid" ? (
                    <div className="grid density-gap-card sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((item) => (
                            <Card key={item.id as string}>
                                <CardContent className="flex flex-col gap-2 pt-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-medium line-clamp-1">
                                                {String(item.name)}
                                            </h3>
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {String(item.sku)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={item.is_active ? "success" : "secondary"}
                                            className="density-caption"
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
                                            className="density-caption"
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
                <CreateEntityDialog
                    config={CREATE_CATALOG_ITEM_CONFIG}
                    open={createOpen}
                    onClose={closeCreate}
                />
            </div>
        </div>
    );

    const config: ListPageConfig = {
        entityKey: "advancing",
        resource: "advancing",
        action: "manage",
        title: "Catalog Management",
        description: "Manage catalog categories and items",
        headerActions: (
            <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Item
            </Button>
        ),
        searchState: {
            value: searchQuery,
            onValueChange: setSearchQuery,
            placeholder: "Search items by name or SKU...",
        },
        toolbarActions: (
            <SegmentedControl value={view} onValueChange={setView} options={[...VIEW_OPTIONS]} />
        ),

        contentSlot,
    };

    return <ListPageShell config={config} isLoading={isLoading} />;
}
