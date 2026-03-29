"use client";

import { logger } from "@/lib/logger";
import { enumLabel, SCAN_ACTION_LABELS } from "@/lib/formatters/enum-labels";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useAssetAssignments,
    useAssets,
    useAssetTags,
    useAssetVersions,
    useCreateAssetAssignment,
    useCreateMaintenanceRecord,
    useDeleteAsset,
    useMaintenanceRecords,
    useUpdateAsset,
} from "@/lib/supabase";
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
import { useAssetScanHistory } from "@/lib/supabase/hooks-scanning";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";
import { QRDisplay, QrGeneratorDialog } from "@/components/scanning";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Calendar,
    ClipboardList,
    Clock,
    DollarSign,
    Edit,
    GitBranch,
    Loader2,
    MapPin,
    Package,
    ScanBarcode,
    Tag,
    Wrench,
} from "lucide-react";

const SCAN_S = SCANNING_STRINGS.assetScanner;

function AssetScanHistoryTab({ assetId }: { assetId: string }) {
    const { data: history, isLoading } = useAssetScanHistory(assetId);
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!history || history.length === 0)
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
                                                ? enumLabel(e.scan_action, SCAN_ACTION_LABELS)
                                                : "Scan"}
                                        </p>
                                        {typeof e.scan_method === "string" && (
                                            <p className="density-caption text-muted-foreground">
                                                via {e.scan_method}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 density-caption text-muted-foreground">
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

function AssetAssignmentsTab({ assetId }: { assetId: string }) {
    const { data: assignments, isLoading } = useAssetAssignments({ asset_id: assetId });
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!assignments || assignments.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Assignments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={ClipboardList}
                        title="No assignments"
                        description="Check out this asset to a project to create an assignment"
                    />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Assignments ({assignments.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {assignments.map((a) => {
                        const rec = a as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(rec.status ?? "assigned").replaceAll("_", " ")}
                                    </p>
                                    {rec.project_id ? (
                                        <p className="text-xs text-muted-foreground">
                                            Project: {String(rec.project_id)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {typeof rec.created_at === "string"
                                        ? formatDate(rec.created_at)
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

function AssetVersionsTab({ assetId }: { assetId: string }) {
    const { data: versions, isLoading } = useAssetVersions({ asset_id: assetId });
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!versions || versions.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Versions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={GitBranch}
                        title="No versions"
                        description="Asset version history will appear here"
                    />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Versions ({versions.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {versions.map((v) => {
                        const rec = v as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        v{String(rec.version_number ?? "—")}
                                    </p>
                                    {rec.change_summary ? (
                                        <p className="text-xs text-muted-foreground">
                                            {String(rec.change_summary)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {typeof rec.created_at === "string"
                                        ? formatDate(rec.created_at)
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

function AssetTagsTab({ assetId }: { assetId: string }) {
    const { data: tags, isLoading } = useAssetTags({ asset_id: assetId });
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!tags || tags.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Tags
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Tag}
                        title="No tags"
                        description="Add tags to categorize this asset"
                    />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags ({tags.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                        const rec = t as Record<string, unknown>;
                        return (
                            <span
                                key={String(rec.id)}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                            >
                                {String(rec.tag_name ?? rec.name ?? "—")}
                            </span>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function AssetMaintenanceTab({ assetId }: { assetId: string }) {
    const { data: records, isLoading } = useMaintenanceRecords({ asset_id: assetId });
    const createRecord = useCreateMaintenanceRecord();
    const handleCreate = async () => {
        try {
            await createRecord.mutateAsync({
                asset_id: assetId,
                description: "Maintenance performed",
                maintenance_type: "routine",
                status: "completed",
            } as unknown as Parameters<typeof createRecord.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to create maintenance record", { error });
        }
    };
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Records {records?.length ? `(${records.length})` : ""}
                </CardTitle>
                <Button size="sm" onClick={handleCreate} disabled={createRecord.isPending}>
                    {createRecord.isPending && (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                    )}
                    Log Maintenance
                </Button>
            </CardHeader>
            <CardContent>
                {!records || records.length === 0 ? (
                    <EmptyState
                        icon={Wrench}
                        title="No maintenance records"
                        description="Log maintenance activities to track asset health"
                    />
                ) : (
                    <div className="space-y-2">
                        {records.map((r) => {
                            const rec = r as Record<string, unknown>;
                            return (
                                <div
                                    key={String(rec.id)}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {String(rec.maintenance_type ?? "routine").replace(
                                                "_",
                                                " "
                                            )}
                                        </p>
                                        {rec.description ? (
                                            <p className="text-xs text-muted-foreground">
                                                {String(rec.description)}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {typeof rec.created_at === "string"
                                            ? formatDate(rec.created_at)
                                            : "—"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "asset",
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
    relatedEntities: [
        {
            title: "Maintenance Schedules",
            entityKey: "maintenance_schedule",
            foreignKey: "asset_id",
            columns: [
                { id: "title", header: "Title", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                {
                    id: "next_date",
                    header: "Next Date",
                    accessorKey: "next_date",
                    fieldType: "date",
                },
            ],
            linkPattern: "/maintenance-schedules/{id}",
        },
    ],
    tabs: [],
};

export function AssetDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
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

    // Performance: Skip the full-list fetch entirely for invalid UUIDs.
    // This prevents an infinite loading state on broken/test links.
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const { data: sbAssets } = useAssets(isValidUuid ? undefined : { _enabled: false });

    const sbAsset = isValidUuid ? sbAssets?.find((a) => a.id === id) : undefined;
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

    // For invalid UUIDs, immediately show "not found" without waiting for useAssets()
    const isLoading = isValidUuid ? !sbAssets : false;

    const handleCheckOut = async () => {
        try {
            await createAssignment.mutateAsync({
                asset_id: id,
                project_id: checkoutProject || null,
                status: "checked_out",
            } as unknown as Parameters<typeof createAssignment.mutateAsync>[0]);
            await updateAsset.mutateAsync({ id, status: "checked_out" } as unknown as Parameters<
                typeof updateAsset.mutateAsync
            >[0]);
            setCheckoutOpen(false);
            setCheckoutProject("");
        } catch (error) {
            logger.error("Failed to check out asset", { error });
        }
    };
    const handleLogMaintenance = async () => {
        try {
            await updateAsset.mutateAsync({
                id,
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
            await updateAsset.mutateAsync({ id, status: "decommissioned" } as unknown as Parameters<
                typeof updateAsset.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to decommission asset", { error });
        }
    };

    const conditionConfig = asset ? ASSET_CONDITION_MAP[asset.condition] : null;
    const isRental = asset?.ownedOrRental === "rental";

    const sidebarSlot = asset ? (
        <div className="density-gap-section">
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
        <div className="density-gap-page">
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
        subtitleFn: () =>
            [asset?.category, conditionConfig?.label].filter(Boolean).join(" · ") || "",
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
                id: "assignments",
                label: "Assignments",
                content: <AssetAssignmentsTab assetId={id} />,
            },
            {
                id: "maintenance",
                label: "Maintenance",
                content: <AssetMaintenanceTab assetId={id} />,
            },
            { id: "versions", label: "Versions", content: <AssetVersionsTab assetId={id} /> },
            { id: "tags", label: "Tags", content: <AssetTagsTab assetId={id} /> },
            { id: "history", label: "Scan History", content: <AssetScanHistoryTab assetId={id} /> },
        ],
    };

    const record = asset ? ({ ...asset } as Record<string, unknown>) : initialRecord;

    return (
        <>
            <DetailPageShell
                config={config}
                id={id}
                record={record as Record<string, unknown> | null}
                isLoading={isLoading && !initialRecord}
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
                    <Button onClick={() => router.push(`/assets/${id}/edit`)}>
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
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
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
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
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
                            {updateAsset.isPending && (
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                            )}
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
                    entityId={id}
                />
            )}
        </>
    );
}
