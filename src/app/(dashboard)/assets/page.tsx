"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useCallback, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAssets, useVehicles } from "@/lib/supabase/hooks";
import { formatCurrency } from "@/lib/utils";
import {
    AlertTriangle,
    Clock,
    LayoutGrid,
    MapPin,
    Package,
    Plus,
    QrCode,
    Table2,
    Truck,
    Upload,
} from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ASSET_CONDITION_MAP as ASSET_CONDITION_CONFIG } from "@/config/domain-config";
import type { Asset, AssetCondition, Vehicle } from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import {
    BooleanField,
    CurrencyField,
    LocationField,
    PhoneField,
} from "@/components/data-view/field-renderers";
import { PermissionGate } from "@/components/permission-guard";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { CsvImportDialog } from "@/components/csv/csv-import-dialog";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_ASSET_CONFIG } from "@/config/create-entity-configs";
import { SegmentedControl } from "@/components/ui/segmented-control";

function computeDaysUntilReturn(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

type ViewMode = "table" | "cards";

const assetColumns: ColumnDef<Asset>[] = [
    {
        id: "name",
        header: "Asset",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div>
                <p className="text-sm font-medium">{row.name}</p>
                {row.notes && (
                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {row.notes}
                    </p>
                )}
            </div>
        ),
    },
    {
        id: "barcode",
        header: "Barcode",
        accessorKey: "barcode",
        render: (v) => (
            <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <QrCode className="h-3 w-3" />
                {String(v)}
            </span>
        ),
    },
    {
        id: "category",
        header: "Category",
        accessorKey: "category",
        sortable: true,
        filterable: true,
    },
    {
        id: "condition",
        header: "Condition",
        accessorKey: "condition",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value) as AssetCondition;
            const cfg = ASSET_CONDITION_CONFIG[v];
            return cfg ? (
                <Badge variant={cfg.variant} className="text-[10px]">
                    {v.replace("_", " ")}
                </Badge>
            ) : (
                <span className="text-xs">{v}</span>
            );
        },
    },
    {
        id: "location",
        header: "Location",
        accessorKey: "location",
        sortable: true,
        render: (value) => <LocationField value={String(value)} />,
    },
    {
        id: "type",
        header: "Type",
        accessorKey: "ownedOrRental",
        sortable: true,
        filterable: true,
        render: (value, row) => {
            const v = String(value);
            const daysUntilReturn = row.rentalReturnDate
                ? Math.ceil(
                      (new Date(row.rentalReturnDate).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                  )
                : null;
            return (
                <div className="flex items-center gap-1.5">
                    <Badge
                        variant={v === "owned" ? "secondary" : "warning"}
                        className="text-[10px]"
                    >
                        {v}
                    </Badge>
                    {daysUntilReturn !== null && (
                        <span
                            className={`text-[10px] font-medium ${daysUntilReturn <= 3 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                            {daysUntilReturn}d left
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: "value",
        header: "Value",
        accessorFn: (row) => row.purchasePrice ?? row.dailyRentalCost ?? 0,
        sortable: true,
        align: "right",
        render: (_v, row) => {
            if (row.purchasePrice) return <CurrencyField value={row.purchasePrice} />;
            if (row.dailyRentalCost)
                return (
                    <span className="text-xs font-medium">
                        {formatCurrency(row.dailyRentalCost)}/day
                    </span>
                );
            return <span className="text-xs text-muted-foreground">—</span>;
        },
    },
];

const vehicleColumns: ColumnDef<Vehicle>[] = [
    {
        id: "name",
        header: "Vehicle",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-[10px] text-muted-foreground">
                    {row.type} · {row.licensePlate}
                </p>
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant =
                v === "available"
                    ? "success"
                    : v === "in_transit"
                      ? "info"
                      : v === "loading"
                        ? "warning"
                        : "ghost";
            return (
                <Badge variant={variant} className="text-[10px]">
                    {v.replace("_", " ")}
                </Badge>
            );
        },
    },
    {
        id: "dockHeight",
        header: "Dock Height",
        accessorKey: "dockHeight",
    },
    {
        id: "driver",
        header: "Driver",
        accessorKey: "driverName",
        sortable: true,
    },
    {
        id: "driverPhone",
        header: "Phone",
        accessorKey: "driverPhone",
        render: (value) => <PhoneField value={String(value)} />,
    },
    {
        id: "gps",
        header: "GPS",
        accessorKey: "gpsEnabled",
        align: "center",
        render: (value) => <BooleanField value={Boolean(value)} />,
    },
];

export default function AssetsPage() {
    const VIEW_MODES = ["table", "cards"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "table",
        validValues: VIEW_MODES,
    });
    const { data: sbAssets, isLoading: loadingAssets, refetch: refetchAssets } = useAssets();
    const [importOpen, setImportOpen] = useState(false);
    const [createOpen, openCreate, closeCreate] = useCreateAction();

    const handleImportComplete = useCallback(() => {
        void refetchAssets();
    }, [refetchAssets]);
    const { data: sbVehicles, isLoading: loadingVehicles } = useVehicles();

    const assets: Asset[] = (sbAssets ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        barcode: a.barcode,
        condition: a.condition as AssetCondition,
        location: a.location,
        ownedOrRental: a.owned_or_rental as "owned" | "rental",
        rentalReturnDate: a.rental_return_date ?? undefined,
        dailyRentalCost: a.daily_rental_cost ?? undefined,
        purchasePrice: a.purchase_price ?? undefined,
        imageUrl: a.image_url ?? undefined,
        notes: a.notes ?? undefined,
    }));

    const vehicles: Vehicle[] = (sbVehicles ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        licensePlate: v.license_plate,
        dockHeight: v.dock_height,
        driverName: v.driver_name,
        driverPhone: v.driver_phone,
        gpsEnabled: v.gps_enabled,
        status: v.status as "available" | "in_transit" | "loading" | "maintenance",
    }));

    const isLoading = loadingAssets || loadingVehicles;

    if (isLoading) {
        return <LoadingState />;
    }

    const rentalAssets = assets.filter((a) => a.ownedOrRental === "rental");
    const needsRepair = assets.filter((a) => a.condition === "needs_repair");
    const totalValue = assets
        .filter((a) => a.purchasePrice)
        .reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

    return (
        <>
            <PermissionGate resource="assets" action="read">
                <div className="space-y-6 animate-fade-in">
                    <PageHeader
                        title="Asset & Fleet Ledger"
                        description="Equipment inventory, rental tracking, and vehicle fleet management"
                    >
                        <div className="flex items-center gap-2">
                            <SegmentedControl<ViewMode>
                                ariaLabel="Asset view mode"
                                value={viewMode}
                                onValueChange={setViewMode}
                                options={[
                                    {
                                        value: "table",
                                        label: "Table",
                                        icon: <Table2 className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                    {
                                        value: "cards",
                                        label: "Cards",
                                        icon: <LayoutGrid className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                ]}
                            />
                            <CsvExportButton entity="assets" />
                            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                                <Upload className="h-4 w-4" />
                                Import CSV
                            </Button>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Add Asset
                            </Button>
                        </div>
                    </PageHeader>
                    <CsvImportDialog
                        entity="assets"
                        open={importOpen}
                        onOpenChange={setImportOpen}
                        onImportComplete={handleImportComplete}
                    />

                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Assets" value={assets.length} icon={Package} />
                        <StatCard
                            title="Portfolio Value"
                            value={formatCurrency(totalValue)}
                            icon={Package}
                        />
                        <StatCard
                            title="Active Rentals"
                            value={rentalAssets.length}
                            description="with return dates"
                            icon={Clock}
                        />
                        <StatCard
                            title="Needs Repair"
                            value={needsRepair.length}
                            icon={AlertTriangle}
                        />
                    </div>

                    {/* Equipment Inventory — Table View */}
                    {viewMode === "table" && (
                        <DataTable<Asset>
                            data={assets}
                            columns={assetColumns}
                            keyField="id"
                            searchable
                            searchPlaceholder="Search assets..."
                            pageSize={15}
                            stickyHeader
                            hoverable
                        />
                    )}

                    {/* Equipment Inventory — Card View */}
                    {viewMode === "cards" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assets.map((asset, i) => {
                                const daysUntilReturn = asset.rentalReturnDate
                                    ? computeDaysUntilReturn(asset.rentalReturnDate)
                                    : null;
                                return (
                                    <StaggerItem key={asset.id} index={i} stagger="relaxed">
                                        <Card>
                                            <CardContent>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold">
                                                            {asset.name}
                                                        </p>
                                                        <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground mt-0.5">
                                                            <QrCode className="h-3 w-3" />
                                                            {asset.barcode}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            ASSET_CONDITION_CONFIG[asset.condition]
                                                                ?.variant ?? "ghost"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {asset.condition.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Category
                                                        </p>
                                                        <p className="font-medium">
                                                            {asset.category}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Location
                                                        </p>
                                                        <p className="font-medium flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {asset.location}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Type
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                asset.ownedOrRental === "owned"
                                                                    ? "secondary"
                                                                    : "warning"
                                                            }
                                                            className="text-[9px]"
                                                        >
                                                            {asset.ownedOrRental}
                                                        </Badge>
                                                        {daysUntilReturn !== null && (
                                                            <span
                                                                className={`ml-1 text-[10px] ${daysUntilReturn <= 3 ? "text-destructive" : "text-muted-foreground"}`}
                                                            >
                                                                {daysUntilReturn}d
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Value
                                                        </p>
                                                        <p className="font-medium">
                                                            {asset.purchasePrice
                                                                ? formatCurrency(
                                                                      asset.purchasePrice
                                                                  )
                                                                : asset.dailyRentalCost
                                                                  ? `${formatCurrency(asset.dailyRentalCost)}/day`
                                                                  : "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </StaggerItem>
                                );
                            })}
                        </div>
                    )}

                    {/* Vehicle Fleet — DataTable */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Vehicle Fleet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable<Vehicle>
                                data={vehicles}
                                columns={vehicleColumns}
                                keyField="id"
                                searchable
                                searchPlaceholder="Search vehicles..."
                                hoverable
                            />
                        </CardContent>
                    </Card>
                </div>
            </PermissionGate>
            <CreateEntityDialog
                config={CREATE_ASSET_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
