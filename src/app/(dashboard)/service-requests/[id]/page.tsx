"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteServiceRequest, useUpdateServiceRequest } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import {
    ArrowRightLeft,
    Calendar,
    CheckCircle2,
    Headphones,
    Loader2,
    MapPin,
    User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useServiceRequest } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "assessment" | "chatter";
const TAB_VALUES = ["details", "assessment", "chatter"] as const;

export default function ServiceRequestDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sr, isLoading } = useServiceRequest(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Service Request",
        listPath: "/service-requests",
        useUpdateHook: useUpdateServiceRequest,
        useDeleteHook: useDeleteServiceRequest,
    });
    void router;
    void handleUpdate;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!sr) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "assessment" as const, label: "Assessment" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Request Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(sr.status) as "default"}>
                            {getStatusLabel(sr.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge
                            variant={
                                sr.priority === "urgent" || sr.priority === "emergency"
                                    ? "destructive"
                                    : sr.priority === "high"
                                      ? "warning"
                                      : "ghost"
                            }
                        >
                            {sr.priority}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Source</span>
                        <Badge variant="outline" className="capitalize">
                            {sr.source.replace(/_/g, " ")}
                        </Badge>
                    </div>
                    {sr.category && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium text-xs capitalize">{sr.category}</span>
                        </div>
                    )}
                    {sr.serviceType && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Service Type</span>
                            <span className="font-medium text-xs capitalize">{sr.serviceType}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Requester</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {sr.requesterName && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{sr.requesterName}</span>
                        </div>
                    )}
                    {sr.requesterEmail && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium text-xs truncate max-w-[140px]">
                                {sr.requesterEmail}
                            </span>
                        </div>
                    )}
                    {sr.requesterPhone && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium text-xs">{sr.requesterPhone}</span>
                        </div>
                    )}
                    {sr.companyName && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Company</span>
                            <span className="font-medium text-xs">{sr.companyName}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {sr.assignedToName && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned To</span>
                            <span className="font-medium">{sr.assignedToName}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {sr.convertedToType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Conversion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Converted To</span>
                            <Badge variant="info" className="capitalize">
                                {sr.convertedToType.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        {sr.convertedAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">
                                    {formatDate(sr.convertedAt, "compact")}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <DetailLayout
            backHref="/service-requests"
            backLabel="Service Requests"
            entityType="service-requests"
            entityId={entityId}
            title={sr.title}
            subtitle={`${sr.priority} priority · ${sr.source.replace(/_/g, " ")}`}
            status={sr.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Headphones className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                        Convert
                    </Button>
                    <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolve
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Request", onClick: () => {} },
                { label: "Assign", onClick: () => {} },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Requester</p>
                                        <p className="text-sm font-semibold">
                                            {sr.requesterName ?? sr.contactName ?? "Unknown"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Preferred Date
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {sr.preferredDate
                                                ? formatDate(sr.preferredDate, "compact")
                                                : "Flexible"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Location</p>
                                        <p className="text-sm font-semibold truncate">
                                            {sr.locationName ?? "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {sr.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {sr.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Schedule Preference</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Preferred Date</span>
                                <span className="font-medium">
                                    {sr.preferredDate
                                        ? formatDate(sr.preferredDate, "compact")
                                        : "—"}
                                </span>
                            </div>
                            {sr.preferredTimeStart && sr.preferredTimeEnd && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time Window</span>
                                    <span className="font-medium">
                                        {sr.preferredTimeStart} – {sr.preferredTimeEnd}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Flexible</span>
                                <Badge variant={sr.isFlexible ? "success" : "ghost"}>
                                    {sr.isFlexible ? "Yes" : "No"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {sr.locationNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Location Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {sr.locationNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {sr.attachmentUrls.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Attachments ({sr.attachmentUrls.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sr.attachmentUrls.map((url: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 p-2 rounded bg-secondary/20"
                                        >
                                            <span className="text-xs font-mono truncate">
                                                {url}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "assessment" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Requires Assessment</span>
                                <Badge variant={sr.requiresAssessment ? "info" : "ghost"}>
                                    {sr.requiresAssessment ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {sr.assessmentDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Assessment Date</span>
                                    <span className="font-medium">
                                        {formatDate(sr.assessmentDate, "compact")}
                                    </span>
                                </div>
                            )}
                            {sr.assessedByName && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Assessed By</span>
                                    <span className="font-medium">{sr.assessedByName}</span>
                                </div>
                            )}
                            {sr.assessmentNotes && (
                                <div className="pt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm leading-relaxed">{sr.assessmentNotes}</p>
                                </div>
                            )}
                            {!sr.requiresAssessment && !sr.assessmentNotes && (
                                <p className="text-muted-foreground text-center py-6">
                                    No assessment required for this request.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {sr.internalNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Internal Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {sr.internalNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="service_request"
                    recordId={sr.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
