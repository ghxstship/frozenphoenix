"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, BarChart3, Loader2, MapPin, Package, Plus, Tag } from "lucide-react";
import { isSupabaseConfigured, useInventoryItems } from "@/lib/supabase/hooks-pages";
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

const mockInventory: InventoryItem[] = [
    {
        id: "1",
        name: 'Black Gaffer Tape (2")',
        sku: "CON-GT-BLK-2",
        category: "Consumables",
        quantity: 240,
        minQuantity: 50,
        location: "Brooklyn Main",
        status: "in_stock",
        unitCost: 12.5,
        lastRestocked: "2026-02-15",
    },
    {
        id: "2",
        name: "XLR Cable 50ft",
        sku: "AUD-XLR-50",
        category: "Audio",
        quantity: 85,
        minQuantity: 30,
        location: "Brooklyn Main",
        status: "in_stock",
        unitCost: 28,
        lastRestocked: "2026-02-01",
    },
    {
        id: "3",
        name: "LED Panel Bracket (Universal)",
        sku: "VID-BRK-UNI",
        category: "Video",
        quantity: 12,
        minQuantity: 20,
        location: "LA Hub",
        status: "low_stock",
        unitCost: 45,
        lastRestocked: "2026-01-20",
    },
    {
        id: "4",
        name: "Safety Harness (Full Body)",
        sku: "SAF-HRN-FB",
        category: "Safety",
        quantity: 0,
        minQuantity: 10,
        location: "Brooklyn Main",
        status: "out_of_stock",
        unitCost: 150,
        lastRestocked: "2025-12-15",
    },
    {
        id: "5",
        name: "Edison Bulb 60W (Warm)",
        sku: "LIT-EDI-60W",
        category: "Lighting",
        quantity: 500,
        minQuantity: 100,
        location: "Brooklyn Main",
        status: "in_stock",
        unitCost: 3.5,
        lastRestocked: "2026-02-10",
    },
    {
        id: "6",
        name: 'Zip Ties 12" (1000pk)',
        sku: "CON-ZT-12",
        category: "Consumables",
        quantity: 8,
        minQuantity: 15,
        location: "Chicago",
        status: "low_stock",
        unitCost: 18,
        lastRestocked: "2026-01-28",
    },
    {
        id: "7",
        name: "Truss Pin (Conical)",
        sku: "RIG-PIN-CON",
        category: "Rigging",
        quantity: 0,
        minQuantity: 50,
        location: "LA Hub",
        status: "on_order",
        unitCost: 2.5,
        lastRestocked: "2026-01-05",
    },
    {
        id: "8",
        name: "Cat6 Ethernet 100ft",
        sku: "NET-CAT6-100",
        category: "Network",
        quantity: 45,
        minQuantity: 20,
        location: "Brooklyn Main",
        status: "in_stock",
        unitCost: 22,
        lastRestocked: "2026-02-12",
    },
    {
        id: "9",
        name: "Haze Fluid (Gallon)",
        sku: "FX-HAZE-GAL",
        category: "Effects",
        quantity: 6,
        minQuantity: 10,
        location: "LA Hub",
        status: "low_stock",
        unitCost: 35,
        lastRestocked: "2026-02-05",
    },
    {
        id: "10",
        name: "Pipe & Drape Set (8ft)",
        sku: "SCN-PD-8FT",
        category: "Scenic",
        quantity: 30,
        minQuantity: 10,
        location: "Brooklyn Main",
        status: "in_stock",
        unitCost: 85,
        lastRestocked: "2026-02-18",
    },
];

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const { data: sbItems, isLoading } = useInventoryItems();

    const items: InventoryItem[] =
        isSupabaseConfigured && sbItems
            ? sbItems.map((i: Record<string, unknown>) => ({
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
              }))
            : mockInventory;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
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
                    <Button size="sm">
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

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No items found</h3>
                            <p className="text-muted-foreground text-center">
                                Adjust filters or search terms
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
