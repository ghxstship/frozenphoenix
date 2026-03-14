"use client";

import React, { useMemo } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssets, useVehicles } from "@/lib/supabase/hooks";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Clock, MapPin, Package, QrCode, ScanBarcode, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { CREATE_ASSET_CONFIG } from "@/config/create-entity-configs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

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

// ─── Asset Card ──────────────────────────────────────────────
function AssetCard({ asset }: { asset: Asset }) {
    const daysUntilReturn = asset.rentalReturnDate
        ? computeDaysUntilReturn(asset.rentalReturnDate)
        : null;
    return (
        <Card>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold">{asset.name}</p>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground mt-0.5">
                            <QrCode className="h-3 w-3" />
                            {asset.barcode}
                        </span>
                    </div>
                    <Badge
                        variant={ASSET_CONDITION_CONFIG[asset.condition]?.variant ?? "ghost"}
                        className="text-[10px]"
                    >
                        {asset.condition.replace("_", " ")}
                    </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{asset.category}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {asset.location}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Type</p>
                        <Badge
                            variant={asset.ownedOrRental === "owned" ? "secondary" : "warning"}
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
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-medium">
                            {asset.purchasePrice
                                ? formatCurrency(asset.purchasePrice)
                                : asset.dailyRentalCost
                                  ? `${formatCurrency(asset.dailyRentalCost)}/day`
                                  : "—"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Content Component (table + cards) ──────────────────────
function AssetsContent({ assets }: { assets: Asset[] }) {
    const VIEW_MODES = ["table", "cards"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "table",
        validValues: VIEW_MODES,
    });

    return (
        <>
            <div className="flex justify-end">
                <SegmentedControl<ViewMode>
                    ariaLabel="Asset view mode"
                    value={viewMode}
                    onValueChange={setViewMode}
                    options={[
                        { value: "table", label: "Table" },
                        { value: "cards", label: "Cards" },
                    ]}
                />
            </div>

            {viewMode === "table" ? (
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
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map((asset, i) => (
                        <StaggerItem key={asset.id} index={i} stagger="relaxed">
                            <AssetCard asset={asset} />
                        </StaggerItem>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── Vehicle Fleet Footer ───────────────────────────────────
function VehicleFleetSection({ vehicles }: { vehicles: Vehicle[] }) {
    return (
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
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function AssetsPage() {
    const { data: sbAssets, isLoading: loadingAssets } = useAssets();
    const { data: sbVehicles, isLoading: loadingVehicles } = useVehicles();

    const assets: Asset[] = useMemo(
        () =>
            (sbAssets ?? []).map((a) => ({
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
            })),
        [sbAssets]
    );

    const vehicles: Vehicle[] = useMemo(
        () =>
            (sbVehicles ?? []).map((v) => ({
                id: v.id,
                name: v.name,
                type: v.type,
                licensePlate: v.license_plate,
                dockHeight: v.dock_height,
                driverName: v.driver_name,
                driverPhone: v.driver_phone,
                gpsEnabled: v.gps_enabled,
                status: v.status as "available" | "in_transit" | "loading" | "maintenance",
            })),
        [sbVehicles]
    );

    const isLoading = loadingAssets || loadingVehicles;

    const config: ListPageConfig = useMemo(
        () => ({
            entityKey: "assets",
            title: "Asset & Fleet Ledger",
            description: "Equipment inventory, rental tracking, and vehicle fleet management",
            icon: Package,
            createConfig: CREATE_ASSET_CONFIG,
            createLabel: "Add Asset",
            exportable: true,
            importable: true,
            searchKeys: ["name", "barcode", "category", "location"],
            stats: [
                { label: "Total Assets", icon: Package, compute: (r) => r.length },
                {
                    label: "Portfolio Value",
                    icon: Package,
                    compute: (r) =>
                        formatCurrency(
                            r
                                .filter((a) => a.purchasePrice)
                                .reduce((sum, a) => sum + ((a.purchasePrice as number) || 0), 0)
                        ),
                },
                {
                    label: "Active Rentals",
                    icon: Clock,
                    filter: (r) => r.ownedOrRental === "rental",
                },
                {
                    label: "Needs Repair",
                    icon: AlertTriangle,
                    filter: (r) => r.condition === "needs_repair",
                },
            ],
            contentSlot: <AssetsContent assets={assets} />,
            footerSlot: <VehicleFleetSection vehicles={vehicles} />,
            toolbarSlot: (
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href="/assets/scan">
                            <ScanBarcode className="h-4 w-4 mr-1" />
                            Scan Assets
                        </Link>
                    </Button>
                </div>
            ),
        }),
        [assets, vehicles]
    );

    return (
        <ListPageShell
            config={config}
            data={assets as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
