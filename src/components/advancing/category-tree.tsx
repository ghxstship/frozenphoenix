"use client";

import * as React from "react";
import { ChevronRight, Folder, FolderOpen, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATALOG_CATEGORY_TYPE_MAP } from "@/config/advancing-config";
import type { CatalogCategoryType } from "@/types";

// ─── Types ───────────────────────────────────────────────────

export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    category_type: CatalogCategoryType;
    item_count: number;
    depth: number;
    parent_id: string | null;
    children: CategoryNode[];
}

interface CategoryTreeProps {
    categories: CategoryNode[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    className?: string | undefined;
}

interface TreeItemProps {
    node: CategoryNode;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
    level: number;
}

// ─── Tree Builder ────────────────────────────────────────────

export function buildCategoryTree(flatCategories: Record<string, unknown>[]): CategoryNode[] {
    const nodeMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const cat of flatCategories) {
        const node: CategoryNode = {
            id: cat.id as string,
            name: cat.name as string,
            slug: cat.slug as string,
            category_type: cat.category_type as CatalogCategoryType,
            item_count: (cat.item_count as number) ?? 0,
            depth: (cat.depth as number) ?? 0,
            parent_id: (cat.parent_id as string) ?? null,
            children: [],
        };
        nodeMap.set(node.id, node);
    }

    for (const node of nodeMap.values()) {
        if (node.parent_id && nodeMap.has(node.parent_id)) {
            nodeMap.get(node.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    const sortByOrder = (a: CategoryNode, b: CategoryNode) => {
        const aSort =
            (flatCategories.find((c) => c.id === a.id) as Record<string, unknown> | undefined)
                ?.sort_order ?? 0;
        const bSort =
            (flatCategories.find((c) => c.id === b.id) as Record<string, unknown> | undefined)
                ?.sort_order ?? 0;
        return (aSort as number) - (bSort as number);
    };

    roots.sort(sortByOrder);
    for (const node of nodeMap.values()) {
        if (node.children.length > 1) {
            node.children.sort(sortByOrder);
        }
    }

    return roots;
}

function getDescendantItemCount(node: CategoryNode): number {
    let count = node.item_count;
    for (const child of node.children) {
        count += getDescendantItemCount(child);
    }
    return count;
}

function collectNodeMap(roots: CategoryNode[]): Map<string, CategoryNode> {
    const map = new Map<string, CategoryNode>();
    const visit = (node: CategoryNode) => {
        map.set(node.id, node);
        for (const child of node.children) visit(child);
    };
    for (const root of roots) visit(root);
    return map;
}

// ─── TreeItem ────────────────────────────────────────────────

function TreeItem({ node, selectedId, onSelect, expandedIds, onToggle, level }: TreeItemProps) {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const totalItems = getDescendantItemCount(node);
    const typeConfig = CATALOG_CATEGORY_TYPE_MAP[node.category_type];
    const TypeIcon = typeConfig?.icon;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowRight":
                if (hasChildren && !isExpanded) {
                    e.preventDefault();
                    onToggle(node.id);
                }
                break;
            case "ArrowLeft":
                if (hasChildren && isExpanded) {
                    e.preventDefault();
                    onToggle(node.id);
                }
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                onSelect(node.id);
                break;
        }
    };

    return (
        <li
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
        >
            <Button
                variant="ghost"
                onClick={() => {
                    onSelect(node.id);
                    if (hasChildren && !isExpanded) onToggle(node.id);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                    "group w-full justify-start gap-2 h-auto px-2 py-1.5",
                    isSelected && "bg-accent text-accent-foreground font-medium",
                    !isSelected && "text-muted-foreground"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                tabIndex={0}
                aria-label={`${node.name}, ${totalItems} items`}
            >
                {hasChildren ? (
                    <ChevronRight
                        className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                            isExpanded && "rotate-90"
                        )}
                        aria-hidden="true"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(node.id);
                        }}
                    />
                ) : (
                    <span className="w-3.5 shrink-0" aria-hidden="true" />
                )}

                {level === 0 && TypeIcon ? (
                    <TypeIcon className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                ) : level === 0 ? (
                    <Folder className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                ) : isExpanded && hasChildren ? (
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
                ) : null}

                <span className="truncate flex-1 text-left">{node.name}</span>

                {totalItems > 0 && (
                    <span
                        className={cn(
                            "ml-auto shrink-0 tabular-nums text-xs",
                            isSelected ? "text-accent-foreground/70" : "text-muted-foreground/50"
                        )}
                    >
                        {totalItems}
                    </span>
                )}
            </Button>

            {hasChildren && isExpanded && (
                <ul
                    role="group"
                    className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-150"
                >
                    {node.children.map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

// ─── CategoryTree ────────────────────────────────────────────

export function CategoryTree({ categories, selectedId, onSelect, className }: CategoryTreeProps) {
    const nodeMap = React.useMemo(() => collectNodeMap(categories), [categories]);

    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
        const initial = new Set<string>();
        if (selectedId) {
            let current = nodeMap.get(selectedId);
            while (current?.parent_id) {
                initial.add(current.parent_id);
                current = nodeMap.get(current.parent_id);
            }
        }
        return initial;
    });

    React.useEffect(() => {
        if (selectedId) {
            setExpandedIds((prev) => {
                const next = new Set(prev);
                let current = nodeMap.get(selectedId);
                let changed = false;
                while (current?.parent_id) {
                    if (!next.has(current.parent_id)) {
                        next.add(current.parent_id);
                        changed = true;
                    }
                    current = nodeMap.get(current.parent_id);
                }
                return changed ? next : prev;
            });
        }
    }, [selectedId, nodeMap]);

    const handleToggle = React.useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const totalItems = React.useMemo(
        () => categories.reduce((sum, c) => sum + getDescendantItemCount(c), 0),
        [categories]
    );

    return (
        <nav className={cn("flex flex-col", className)} aria-label="Catalog categories">
            <Button
                variant="ghost"
                onClick={() => onSelect(null)}
                className={cn(
                    "w-full justify-start gap-2 h-auto px-2 py-1.5 mb-1",
                    selectedId === null && "bg-accent text-accent-foreground font-medium",
                    selectedId !== null && "text-muted-foreground"
                )}
                aria-label={`All categories, ${totalItems} items`}
            >
                <LayoutGrid className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                <span className="flex-1 text-left">All Categories</span>
                <span
                    className={cn(
                        "ml-auto shrink-0 tabular-nums text-xs",
                        selectedId === null
                            ? "text-accent-foreground/70"
                            : "text-muted-foreground/50"
                    )}
                >
                    {totalItems}
                </span>
            </Button>

            <div className="h-px bg-border my-1" role="separator" />

            <ul role="tree" aria-label="Category hierarchy" className="flex-1 overflow-y-auto">
                {categories.map((root) => (
                    <TreeItem
                        key={root.id}
                        node={root}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        expandedIds={expandedIds}
                        onToggle={handleToggle}
                        level={0}
                    />
                ))}
            </ul>
        </nav>
    );
}
