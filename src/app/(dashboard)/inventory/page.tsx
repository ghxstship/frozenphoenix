"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_INVENTORY_ITEM_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, BarChart3, MapPin, Package, Plus, Tag } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useInventoryItems } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_order";

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    minQuantity: number;
    location: string;
    status: StockStatus;
    unitCost: number;
    lastRestocked: string;
}

export default function InventoryPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const { data: sbItems, isLoading } = useInventoryItems();

    const items: InventoryItem[] = (sbItems ?? []).map((i: Record<string, unknown>) => ({
        id: (i.id as string) ?? "",
        name: (i.name as string) ?? "",
        sku: (i.sku as string) ?? "",
        category: (i.category as string) ?? "",
        quantity: (i.quantity as number) ?? 0,
        minQuantity: (i.min_quantity as number) ?? 0,
        location: (i.location as string) ?? "",
        status: ((i.status as string) ?? "in_stock") as StockStatus,
        unitCost: (i.unit_cost as number) ?? 0,
        lastRestocked: (i.last_restocked as string) ?? "",
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const categories = ["all", ...new Set(items.map((i) => i.category))];

    const filtered = items.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCat;
    });

    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const lowStockCount = items.filter(
        (i) => i.status === "low_stock" || i.status === "out_of_stock"
    ).length;

    return (
        <PermissionGate resource="inventory" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Inventory"
                    description="Track stock levels, consumables, and reorder points"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Items" value={items.length} icon={Package} />
                    <StatCard
                        title="Total Value"
                        value={`$${Math.round(totalValue).toLocaleString()}`}
                        icon={BarChart3}
                    />
                    <StatCard
                        title="Low / Out of Stock"
                        value={lowStockCount}
                        icon={AlertTriangle}
                    />
                    <StatCard title="Categories" value={categories.length - 1} icon={Tag} />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search by name or SKU..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {(
                            ["all", "in_stock", "low_stock", "out_of_stock", "on_order"] as const
                        ).map((s) => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === "all" ? "All" : getStatusLabel(s)}
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={categoryFilter === cat ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {cat === "all" ? "All Categories" : cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No items found"
                        description={
                            searchQuery || categoryFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Add your first inventory item"
                        }
                        action={
                            !searchQuery && categoryFilter === "all"
                                ? { label: "New Item", onClick: openCreate }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-2">
                        {filtered.map((item, i) => {
                            return (
                                <StaggerItem key={item.id} index={i} stagger="tight">
                                    <Card className="hover:shadow-sm transition-all">
                                        <CardContent className="py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold truncate">
                                                                {item.name}
                                                            </h3>
                                                            <StatusBadge
                                                                status={item.status}
                                                                className="text-[10px] shrink-0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                                            <span className="font-mono">
                                                                {item.sku}
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <Tag className="h-2.5 w-2.5" />
                                                                {item.category}
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                {item.location}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm shrink-0">
                                                    <div className="text-right">
                                                        <p className="font-bold">{item.quantity}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            min: {item.minQuantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            ${item.unitCost.toFixed(2)}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            unit cost
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_INVENTORY_ITEM_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
