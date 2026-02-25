"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_DEALS } from "@/lib/mock-data";
import { DEAL_STAGE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Edit,
    DollarSign,
    Calendar,
    User,
    Mail,
    Building2,
    TrendingUp,
    Filter,
} from "lucide-react";

type TabId = "overview" | "activity" | "notes";

function computeDaysToClose(dateStr: string): number {
    return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function DealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dealId = params.id as string;
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const deal = MOCK_DEALS.find((d) => d.id === dealId);

    if (!deal) {
        return (
            <EmptyState
                icon={Filter}
                title="Deal not found"
                description="The deal you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Pipeline", onClick: () => router.push("/pipeline") }}
            />
        );
    }

    const stageConfig = DEAL_STAGE_MAP[deal.stage];
    const weightedValue = deal.value * (deal.probability / 100);
    const daysToClose = computeDaysToClose(deal.expectedCloseDate);

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "activity" as const, label: "Activity" },
        { id: "notes" as const, label: "Notes" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Deal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Stage</span>
                        <Badge variant={stageConfig.variant}>{stageConfig.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-medium">{deal.probability}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Close</span>
                        <span>{formatDate(deal.expectedCloseDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned To</span>
                        <span>{deal.assignedTo}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{deal.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${deal.contactEmail}`} className="text-primary hover:underline">
                            {deal.contactEmail}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{deal.company}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/pipeline"
            backLabel="Pipeline"
            title={deal.title}
            subtitle={deal.company}
            status={deal.stage}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                    {deal.company.charAt(0)}
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/deals/${dealId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
            menuItems={[
                { label: "Convert to Project", onClick: () => {} },
                { label: "Mark as Won", onClick: () => {} },
                { label: "Mark as Lost", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Value Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard title="Deal Value" value={formatCurrency(deal.value)} icon={DollarSign} />
                        <StatCard title="Weighted Value" value={formatCurrency(weightedValue)} icon={TrendingUp} />
                        <StatCard title="Days to Close" value={daysToClose} icon={Calendar} />
                    </div>

                    {/* Notes */}
                    {deal.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{deal.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                    <div>
                                        <p className="text-sm font-medium">Deal Created</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(deal.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2" />
                                    <div>
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(deal.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "activity" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Activity tracking will be available when connected to Supabase
                        </p>
                    </CardContent>
                </Card>
            )}

            {activeTab === "notes" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Notes & Comments</CardTitle>
                        <Button size="sm">Add Note</Button>
                    </CardHeader>
                    <CardContent>
                        {deal.notes ? (
                            <div className="p-4 rounded-lg bg-secondary/30">
                                <p className="text-sm">{deal.notes}</p>
                                <p className="text-xs text-muted-foreground mt-2">Added on {formatDate(deal.createdAt)}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No notes yet. Add a note to track important information.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </DetailLayout>
    );
}
