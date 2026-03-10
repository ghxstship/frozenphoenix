"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_WAREHOUSE_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Loader2,
    MapPin,
    Package,
    Plus,
    Shield,
    Thermometer,
    Truck,
    Warehouse,
} from "lucide-react";
import { useWarehouses } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type WarehouseStatus = "active" | "maintenance" | "full" | "inactive";

interface WarehouseItem {
    id: string;
    name: string;
    address: string;
    city: string;
    status: WarehouseStatus;
    capacity: number;
    utilized: number;
    climate: string;
    securityLevel: string;
    manager: string;
    activeShipments: number;
}

export default function WarehousesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: sbWarehouses, isLoading } = useWarehouses();

    const warehouses: WarehouseItem[] = (sbWarehouses ?? []).map((w: Record<string, unknown>) => ({
        id: (w.id as string) ?? "",
        name: (w.name as string) ?? "",
        address: (w.address as string) ?? "",
        city: (w.city as string) ?? "",
        status: ((w.status as string) ?? "active") as WarehouseStatus,
        capacity: (w.capacity as number) ?? 0,
        utilized: (w.utilized as number) ?? 0,
        climate: (w.climate as string) ?? "",
        securityLevel: (w.security_level as string) ?? "",
        manager: (w.manager as string) ?? "",
        activeShipments: (w.active_shipments as number) ?? 0,
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = warehouses.filter(
        (w) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalUtilized = warehouses.reduce((sum, w) => sum + w.utilized, 0);

    return (
        <PermissionGate resource="warehouses" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Warehouses"
                    description="Manage storage facilities and inventory locations"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Warehouse
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Facilities" value={warehouses.length} icon={Warehouse} />
                    <StatCard
                        title="Active"
                        value={warehouses.filter((w) => w.status === "active").length}
                        icon={Shield}
                    />
                    <StatCard
                        title="Utilization"
                        value={`${Math.round((totalUtilized / totalCapacity) * 100)}%`}
                        icon={Package}
                    />
                    <StatCard
                        title="Active Shipments"
                        value={warehouses.reduce((sum, w) => sum + w.activeShipments, 0)}
                        icon={Truck}
                    />
                </div>

                <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search warehouses..."
                    className="max-w-sm"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((wh, i) => {
                        const utilPercent = Math.round((wh.utilized / wh.capacity) * 100);
                        return (
                            <StaggerItem key={wh.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-all">
                                    <CardContent className="py-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold">{wh.name}</h3>
                                                    <StatusBadge status={wh.status} />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {wh.address}, {wh.city}
                                                </p>
                                            </div>
                                            <Warehouse className="h-8 w-8 text-muted-foreground/20" />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-muted-foreground">
                                                    Capacity
                                                </span>
                                                <span className="font-medium">
                                                    {wh.utilized.toLocaleString()} /{" "}
                                                    {wh.capacity.toLocaleString()} sq ft
                                                </span>
                                            </div>
                                            <ProgressBar value={utilPercent} size="md" />
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {utilPercent}% utilized
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Thermometer className="h-3 w-3" />
                                                {wh.climate}
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Shield className="h-3 w-3" />
                                                {wh.securityLevel}
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Truck className="h-3 w-3" />
                                                {wh.activeShipments} shipments
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            </div>
            <CreateEntityDialog config={CREATE_WAREHOUSE_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
