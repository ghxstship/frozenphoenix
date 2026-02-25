"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import {
    Warehouse, Plus, Search, MapPin, Package,
    Thermometer, Shield, Truck,
} from "lucide-react";

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

const mockWarehouses: WarehouseItem[] = [
    { id: "1", name: "Brooklyn Main Depot", address: "450 Industrial Ave", city: "Brooklyn, NY", status: "active", capacity: 25000, utilized: 18500, climate: "Climate-controlled", securityLevel: "24/7 monitored", manager: "Tom Harris", activeShipments: 3 },
    { id: "2", name: "LA Production Hub", address: "8800 Sunset Blvd", city: "Los Angeles, CA", status: "active", capacity: 40000, utilized: 32000, climate: "Standard", securityLevel: "24/7 monitored", manager: "Ana Petrova", activeShipments: 5 },
    { id: "3", name: "Chicago Staging", address: "1200 W Fulton St", city: "Chicago, IL", status: "maintenance", capacity: 15000, utilized: 8000, climate: "Heated", securityLevel: "Alarm system", manager: "James Brown", activeShipments: 0 },
    { id: "4", name: "Miami Overflow", address: "2200 NW 2nd Ave", city: "Miami, FL", status: "full", capacity: 10000, utilized: 10000, climate: "Climate-controlled", securityLevel: "24/7 monitored", manager: "Rachel Green", activeShipments: 2 },
];

export default function WarehousesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = mockWarehouses.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCapacity = mockWarehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalUtilized = mockWarehouses.reduce((sum, w) => sum + w.utilized, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Warehouses" description="Manage storage facilities and inventory locations">
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Warehouse</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Facilities" value={mockWarehouses.length} icon={Warehouse} />
                <StatCard title="Active" value={mockWarehouses.filter(w => w.status === "active").length} icon={Shield} />
                <StatCard title="Utilization" value={`${Math.round((totalUtilized / totalCapacity) * 100)}%`} icon={Package} />
                <StatCard title="Active Shipments" value={mockWarehouses.reduce((sum, w) => sum + w.activeShipments, 0)} icon={Truck} />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search warehouses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((wh, i) => {
                    const utilPercent = Math.round((wh.utilized / wh.capacity) * 100);
                    return (
                        <Card key={wh.id} className="hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                            <CardContent className="py-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold">{wh.name}</h3>
                                            <StatusBadge status={wh.status} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{wh.address}, {wh.city}</p>
                                    </div>
                                    <Warehouse className="h-8 w-8 text-muted-foreground/20" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Capacity</span>
                                        <span className="font-medium">{wh.utilized.toLocaleString()} / {wh.capacity.toLocaleString()} sq ft</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${utilPercent >= 90 ? "bg-destructive" : utilPercent >= 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${utilPercent}%` }} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">{utilPercent}% utilized</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground"><Thermometer className="h-3 w-3" />{wh.climate}</div>
                                    <div className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" />{wh.securityLevel}</div>
                                    <div className="flex items-center gap-1 text-muted-foreground"><Truck className="h-3 w-3" />{wh.activeShipments} shipments</div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
