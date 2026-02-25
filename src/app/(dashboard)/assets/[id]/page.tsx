"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConditionBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_ASSETS } from "@/lib/mock-data";
import { ASSET_CONDITION_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Edit,
    MapPin,
    Barcode,
    DollarSign,
    Calendar,
    Package,
    History,
    AlertTriangle,
} from "lucide-react";

type TabId = "overview" | "history" | "maintenance";

export default function AssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assetId = params.id as string;
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const asset = MOCK_ASSETS.find((a) => a.id === assetId);

    if (!asset) {
        return (
            <EmptyState
                icon={Package}
                title="Asset not found"
                description="The asset you're looking for doesn't exist."
                action={{ label: "Back to Assets", onClick: () => router.push("/assets") }}
            />
        );
    }

    const conditionConfig = ASSET_CONDITION_MAP[asset.condition];
    const isRental = asset.ownedOrRental === "rental";

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "history" as const, label: "History" },
        { id: "maintenance" as const, label: "Maintenance" },
    ];

    const sidebar = (
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
                        <Badge variant={conditionConfig.variant}>{conditionConfig.label}</Badge>
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
    );

    return (
        <DetailLayout
            backHref="/assets"
            backLabel="Assets"
            title={asset.name}
            subtitle={asset.category}
            status={asset.condition}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                    {asset.category.charAt(0)}
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/assets/${assetId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
            menuItems={[
                { label: "Check Out", onClick: () => {} },
                { label: "Schedule Maintenance", onClick: () => {} },
                { label: "Print Label", onClick: () => {} },
                { label: "Decommission", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {asset.purchasePrice && (
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs">Purchase Price</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(asset.purchasePrice)}</p>
                                </CardContent>
                            </Card>
                        )}
                        {isRental && asset.dailyRentalCost && (
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs">Daily Rental Cost</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(asset.dailyRentalCost)}/day</p>
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

                    {/* Notes */}
                    {asset.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{asset.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Condition */}
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
            )}

            {activeTab === "history" && (
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
            )}

            {activeTab === "maintenance" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Maintenance Records</CardTitle>
                        <Button size="sm">Log Maintenance</Button>
                    </CardHeader>
                    <CardContent>
                        <EmptyState
                            icon={Package}
                            title="No maintenance records"
                            description="Log maintenance activities to track asset health"
                            action={{ label: "Log Maintenance", onClick: () => {} }}
                        />
                    </CardContent>
                </Card>
            )}
        </DetailLayout>
    );
}
