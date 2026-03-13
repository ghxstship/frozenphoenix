"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
    useDeleteDispatchRecord,
    useDispatchRecord,
    useUpdateDispatchRecord,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/locale";
import { MapPin, Package, Truck } from "lucide-react";

type TabId = "overview" | "tracking" | "chatter";
const TAB_VALUES = ["overview", "tracking", "chatter"] as const;

export default function DispatchDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: record, isLoading } = useDispatchRecord(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Dispatch",
        listPath: "/dispatch",
        useUpdateHook: useUpdateDispatchRecord,
        useDeleteHook: useDeleteDispatchRecord,
    });

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return <LoadingState />;
    }

    const d = record as Record<string, unknown> | undefined;
    if (!d) {
        return (
            <EmptyState
                icon={Truck}
                title="Dispatch record not found"
                description="This dispatch record may have been removed."
            />
        );
    }

    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "You",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "tracking" as const, label: "Tracking" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium capitalize">{String(d.status ?? "pending")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Carrier</span>
                <p className="font-medium">{String(d.carrier ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">
                    {d.created_at ? formatDate(String(d.created_at)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/dispatch"
            backLabel="Dispatch"
            entityType="dispatch"
            entityId={entityId}
            title={String(d.tracking_number ?? d.name ?? `DISP-${entityId.slice(0, 8)}`)}
            subtitle="Dispatch Record"
            status={String(d.status ?? "pending")}
            menuItems={[...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Origin
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p>{String(d.origin_address ?? d.origin_location_id ?? "—")}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Destination
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p>
                                    {String(
                                        d.destination_address ?? d.destination_location_id ?? "—"
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" /> Shipment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Weight</span>
                                <span>{d.weight ? `${d.weight} kg` : "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Notes</span>
                                <span>{String(d.notes ?? "—")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "tracking" && (
                <EmptyState
                    icon={MapPin}
                    title="No tracking updates"
                    description="Tracking timeline and status updates for this dispatch will appear here."
                    compact
                />
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="dispatch"
                    recordId={entityId}
                    comments={chatterComments}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
