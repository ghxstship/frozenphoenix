"use client";

import { logger } from "@/lib/logger";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteAsset, useUpdateAsset as useUpdateAssetHook } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useAssets, useCreateAssetAssignment, useUpdateAsset } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Barcode,
    Calendar,
    DollarSign,
    Edit,
    History,
    Loader2,
    MapPin,
    Package,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "assets",
    titleKey: "name",
    statusKey: "condition",
    icon: Package,
    backHref: "/assets",
    backLabel: "Assets",
    chatterRecordType: "asset",
    fields: [],
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
    const conditionConfig = asset ? ASSET_CONDITION_MAP[asset.condition] : null;
    const isRental = asset?.ownedOrRental === "rental";

    const sidebarSlot = asset ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Asset Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{asset.category}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition</span>
                        {conditionConfig && (
                            <Badge variant={conditionConfig.variant}>{conditionConfig.label}</Badge>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Ownership</span>
                        <Badge variant={isRental ? "warning" : "default"}>
                            {isRental ? "Rental" : "Owned"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs">{asset.barcode}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Location</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{asset.location}</span>
                    </div>
                </CardContent>
            </Card>
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
        </div>
    ) : undefined;

    const overviewSlot = asset ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!!asset.purchasePrice && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Purchase Price</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(asset.purchasePrice)}
                            </p>
                        </CardContent>
                    </Card>
                )}
                {isRental && !!asset.dailyRentalCost && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Daily Rental Cost</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(asset.dailyRentalCost)}/day
                            </p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">Current Location</span>
                        </div>
                        <p className="text-xl font-bold">{asset.location}</p>
                    </CardContent>
                </Card>
            </div>
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
        tabs: [
            {
                id: "history",
                label: "History",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Usage History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={History}
                                title="No history recorded"
                                description="Asset usage history will appear here when connected to Supabase"
                            />
                        </CardContent>
                    </Card>
                ),
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
        </>
    );
}
