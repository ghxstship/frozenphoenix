"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_VEHICLE_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useVehicles } from "@/lib/supabase/hooks";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    AlertTriangle,
    CheckCircle2,
    MapPin,
    Navigation,
    Phone,
    Plus,
    Truck,
    User,
} from "lucide-react";
import type { Vehicle } from "@/types";
import { getStatusBgColor, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import type { BadgeVariant } from "@/config/ui-variants";
import { PermissionGate } from "@/components/permission-guard";

export default function FleetPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbVehicles, isLoading } = useVehicles();

    const vehicles: Vehicle[] = (sbVehicles ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        licensePlate: v.license_plate,
        dockHeight: v.dock_height,
        driverName: v.driver_name,
        driverPhone: v.driver_phone,
        gpsEnabled: v.gps_enabled,
        status: v.status as Vehicle["status"],
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const availableCount = vehicles.filter((v) => v.status === "available").length;
    const inTransitCount = vehicles.filter((v) => v.status === "in_transit").length;

    return (
        <PermissionGate resource="fleet" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Fleet Management"
                    description="Vehicle tracking, dispatch, and logistics coordination"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Add Vehicle
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Fleet" value={vehicles.length} icon={Truck} />
                    <StatCard title="Available" value={availableCount} icon={CheckCircle2} />
                    <StatCard title="In Transit" value={inTransitCount} icon={Navigation} />
                    <StatCard
                        title="GPS Active"
                        value={vehicles.filter((v) => v.gpsEnabled).length}
                        icon={MapPin}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fleet Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {vehicles.map((vehicle, i) => {
                                        return (
                                            <StaggerItem
                                                key={vehicle.id}
                                                index={i}
                                                stagger="relaxed"
                                            >
                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                                    <div
                                                        className={`h-12 w-12 rounded-xl ${getStatusBgColor(vehicle.status)} flex items-center justify-center`}
                                                    >
                                                        <Truck className="h-6 w-6 text-primary-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-bold">
                                                                {vehicle.name}
                                                            </h3>
                                                            <Badge
                                                                variant={
                                                                    getStatusVariant(
                                                                        vehicle.status
                                                                    ) as BadgeVariant
                                                                }
                                                                className="text-[9px]"
                                                            >
                                                                {getStatusLabel(vehicle.status)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                            <span>{vehicle.type}</span>
                                                            <span>·</span>
                                                            <span>{vehicle.licensePlate}</span>
                                                            <span>·</span>
                                                            <span>Dock: {vehicle.dockHeight}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right hidden sm:block">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                                            <User className="h-3 w-3" />
                                                            {vehicle.driverName}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {vehicle.driverPhone}
                                                        </div>
                                                    </div>
                                                    {vehicle.gpsEnabled && (
                                                        <div className="flex items-center gap-1 text-success text-[10px]">
                                                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                                            GPS
                                                        </div>
                                                    )}
                                                </div>
                                            </StaggerItem>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Dispatch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Select Vehicle</label>
                                    <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm">
                                        <option value="">Choose vehicle...</option>
                                        {vehicles
                                            .filter((v) => v.status === "available")
                                            .map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Destination</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address..."
                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                                    />
                                </div>
                                <Button className="w-full" size="sm">
                                    <Navigation className="h-4 w-4" />
                                    Dispatch Vehicle
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {(
                                    ["available", "in_transit", "loading", "maintenance"] as const
                                ).map((status) => {
                                    const count = vehicles.filter(
                                        (v) => v.status === status
                                    ).length;
                                    return (
                                        <div
                                            key={status}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-2.5 w-2.5 rounded-full ${getStatusBgColor(status)}`}
                                                />
                                                <span className="text-xs font-medium">
                                                    {getStatusLabel(status)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold">{count}</span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                    Maintenance Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                                        <p className="text-xs font-medium">Box Truck #3</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Oil change due in 500 miles
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-muted">
                                        <p className="text-xs font-medium">Sprinter Van #1</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Inspection due: Mar 15, 2026
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <CreateEntityDialog
                config={CREATE_VEHICLE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
