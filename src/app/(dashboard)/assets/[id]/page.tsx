"use client";

import { logger } from "@/lib/logger";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteAsset } from "@/lib/supabase";
import { useUpdateAsset as useUpdateAssetHook } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConditionBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { ASSET_CONDITION_MAP } from "@/config/domain-config";
import { useAssets, useCreateAssetAssignment, useUpdateAsset } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    Loader2,
    MapPin,
    Package,
    ScanBarcode,
} from "lucide-react";
import { QRDisplay, QrGeneratorDialog } from "@/components/scanning";
import { useAssetScanHistory } from "@/lib/supabase/hooks-scanning";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const SCAN_S = SCANNING_STRINGS.assetScanner;

function AssetScanHistoryTab({ assetId }: { assetId: string }) {
    const { data: history, isLoading } = useAssetScanHistory(assetId);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!history || history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5" />
                        {SCAN_S.scanHistory}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={ScanBarcode}
                        title="No scan history"
                        description="Scans for this asset will appear here"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ScanBarcode className="h-5 w-5" />
                    {SCAN_S.scanHistory} ({history.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {history.map((entry, i) => {
                        const e = entry as Record<string, unknown>;
                        return (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg border"
                            >
                                <div className="flex items-center gap-2">
                                    <ScanBarcode className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium">
                                            {typeof e.scan_action === "string"
                                                ? e.scan_action.replace("_", " ").toUpperCase()
                                                : "Scan"}
                                        </p>
                                        {typeof e.scan_method === "string" && (
                                            <p className="text-[10px] text-muted-foreground">
                                                via {e.scan_method}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {typeof e.scanned_at === "string"
                                        ? formatDate(e.scanned_at)
                                        : "—"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "assets",
    titleKey: "name",
    statusKey: "condition",
    icon: Package,
    backHref: "/assets",
    backLabel: "Assets",
    chatterRecordType: "asset",
    fields: [
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "condition", label: "Condition", accessorKey: "condition", fieldType: "status" },
        {
            id: "ownedOrRental",
            label: "Ownership",
            accessorKey: "ownedOrRental",
            fieldType: "status",
        },
        { id: "barcode", label: "Barcode", accessorKey: "barcode" },
        { id: "location", label: "Location", accessorKey: "location" },
        {
            id: "purchasePrice",
            label: "Purchase Price",
            accessorKey: "purchasePrice",
            fieldType: "currency",
            icon: DollarSign,
        },
    ],
    sidebarFields: [
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "condition", label: "Condition", accessorKey: "condition", fieldType: "status" },
        {
            id: "ownedOrRental",
            label: "Ownership",
            accessorKey: "ownedOrRental",
            fieldType: "status",
        },
        { id: "barcode", label: "Barcode", accessorKey: "barcode" },
        { id: "location", label: "Location", accessorKey: "location" },
    ],
    tabs: [],
};

export default function AssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assetId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: assetId,
        entityLabel: "Asset",
        listPath: "/assets",
        useUpdateHook: useUpdateAssetHook,
        useDeleteHook: useDeleteAsset,
    });
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [maintenanceOpen, setMaintenanceOpen] = useState(false);
    const [checkoutProject, setCheckoutProject] = useState("");
    const [maintenanceNote, setMaintenanceNote] = useState("");
    const updateAsset = useUpdateAsset();
    const createAssignment = useCreateAssetAssignment();
    const { data: sbAssets } = useAssets();

    const sbAsset = sbAssets?.find((a) => a.id === assetId);
    const asset = sbAsset
        ? {
              id: sbAsset.id,
              name: sbAsset.name,
              category: sbAsset.category,
              barcode: sbAsset.barcode ?? "",
              location: sbAsset.location ?? "",
              condition: sbAsset.condition as "excellent" | "good" | "fair" | "needs_repair",
              ownedOrRental: sbAsset.owned_or_rental as "owned" | "rental",
              purchasePrice: sbAsset.purchase_price ?? 0,
              dailyRentalCost: (sbAsset as Record<string, unknown>).daily_rental_cost as
                  | number
                  | undefined,
              rentalReturnDate: (sbAsset as Record<string, unknown>).rental_return_date as
                  | string
                  | undefined,
              notes: sbAsset.notes ?? "",
              status: ((sbAsset as Record<string, unknown>).status as string) ?? "available",
          }
        : null;

    const handleCheckOut = async () => {
        try {
            await createAssignment.mutateAsync({
                asset_id: assetId,
                project_id: checkoutProject || null,
                status: "checked_out",
            } as unknown as Parameters<typeof createAssignment.mutateAsync>[0]);
            await updateAsset.mutateAsync({
                id: assetId,
                status: "checked_out",
            } as unknown as Parameters<typeof updateAsset.mutateAsync>[0]);
            setCheckoutOpen(false);
            setCheckoutProject("");
        } catch (error) {
            logger.error("Failed to check out asset", { error });
        }
    };

    const handleLogMaintenance = async () => {
        try {
            await updateAsset.mutateAsync({
                id: assetId,
                condition: "good",
                notes: maintenanceNote || "Maintenance performed",
            } as unknown as Parameters<typeof updateAsset.mutateAsync>[0]);
            setMaintenanceOpen(false);
            setMaintenanceNote("");
        } catch (error) {
            logger.error("Failed to log maintenance", { error });
        }
    };

    const handleDecommission = async () => {
        try {
            await updateAsset.mutateAsync({
                id: assetId,
                status: "decommissioned",
            } as unknown as Parameters<typeof updateAsset.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to decommission asset", { error });
        }
    };

    const isLoading = !sbAssets;
    const _conditionConfig = asset ? ASSET_CONDITION_MAP[asset.condition] : null;
    const isRental = asset?.ownedOrRental === "rental";

    const sidebarSlot = asset ? (
        <div className="space-y-4">
            {isRental && asset.rentalReturnDate && (
                <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-warning mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Rental Return Due</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatDate(asset.rentalReturnDate)}
                        </p>
                    </CardContent>
                </Card>
            )}
            {asset.condition === "needs_repair" && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Needs Repair</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {asset.notes || "This asset requires maintenance"}
                        </p>
                    </CardContent>
                </Card>
            )}
            {asset.barcode && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-2">
                        <QRDisplay value={asset.barcode} size={160} label={asset.name} />
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => setQrDialogOpen(true)}
                        >
                            Download / Print
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const overviewSlot = asset ? (
        <div className="space-y-6">
            {!!asset.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{asset.notes}</p>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Condition Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <ConditionBadge condition={asset.condition} className="text-sm px-3 py-1" />
                        <p className="text-sm text-muted-foreground">
                            Last inspected: Not recorded
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => asset?.category ?? "",
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Purchase Price",
                icon: DollarSign,
                compute: () => formatCurrency(asset?.purchasePrice ?? 0),
            },
            { label: "Location", icon: MapPin, compute: () => asset?.location ?? "—" },
            ...(isRental && asset?.dailyRentalCost
                ? [
                      {
                          label: "Daily Rental",
                          icon: DollarSign,
                          compute: () => `${formatCurrency(asset.dailyRentalCost!)}/day`,
                      },
                  ]
                : []),
        ],
        tabs: [
            {
                id: "history",
                label: "History",
                content: <AssetScanHistoryTab assetId={assetId} />,
            },
            {
                id: "maintenance",
                label: "Maintenance",
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Maintenance Records</CardTitle>
                            <Button size="sm" onClick={() => setMaintenanceOpen(true)}>
                                Log Maintenance
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={Package}
                                title="No maintenance records"
                                description="Log maintenance activities to track asset health"
                                action={{
                                    label: "Log Maintenance",
                                    onClick: () => setMaintenanceOpen(true),
                                }}
                            />
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    const record = asset ? ({ ...asset } as Record<string, unknown>) : null;

    return (
        <>
            <DetailPageShell
                config={config}
                id={assetId}
                record={record}
                isLoading={isLoading}
                menuItems={[
                    { label: "Check Out", onClick: () => setCheckoutOpen(true) },
                    { label: "Log Maintenance", onClick: () => setMaintenanceOpen(true) },
                    { label: "Print Label", onClick: () => window.print() },
                    {
                        label: updateAsset.isPending ? "Decommissioning..." : "Decommission",
                        onClick: handleDecommission,
                        variant: "destructive",
                    },
                    ...crudMenuItems,
                ]}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {asset?.category.charAt(0) ?? "A"}
                    </div>
                }
                actions={
                    <Button onClick={() => router.push(`/assets/${assetId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />

            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check Out Asset</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Project ID (optional)</label>
                        <Input
                            placeholder="Enter project ID"
                            value={checkoutProject}
                            onChange={(e) => setCheckoutProject(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCheckoutOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCheckOut} disabled={createAssignment.isPending}>
                            {createAssignment.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Check Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Maintenance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Maintenance Notes</label>
                        <textarea
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                            placeholder="Describe maintenance performed..."
                            value={maintenanceNote}
                            onChange={(e) => setMaintenanceNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setMaintenanceOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleLogMaintenance} disabled={updateAsset.isPending}>
                            {updateAsset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {asset?.barcode && (
                <QrGeneratorDialog
                    open={qrDialogOpen}
                    onOpenChange={setQrDialogOpen}
                    value={asset.barcode}
                    label={asset.name}
                    entityType="asset"
                    entityId={assetId}
                />
            )}
        </>
    );
}
