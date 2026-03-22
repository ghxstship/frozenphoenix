"use client";

import { useRouter } from "next/navigation";
import {
    useDeleteServiceRequest,
    useServiceRequest,
    useUpdateServiceRequest,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { ArrowRightLeft, CheckCircle2, Headphones } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "service_request",
    titleKey: "title",
    subtitleFn: (r) =>
        `${String(r.priority ?? "")} priority · ${String(r.source ?? "").replace(/_/g, " ")}`,
    statusKey: "status",
    icon: Headphones,
    backHref: "/service-requests",
    backLabel: "Service Requests",
    chatterRecordType: "service_request",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "priority", label: "Priority", accessorKey: "priority" },
        { id: "source", label: "Source", accessorKey: "source" },
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "service_type", label: "Service Type", accessorKey: "service_type" },
        { id: "requester_name", label: "Requester", accessorKey: "requester_name" },
        { id: "requester_email", label: "Email", accessorKey: "requester_email" },
    ],
    fields: [
        { id: "requester_name", label: "Requester", accessorKey: "requester_name" },
        {
            id: "preferred_date",
            label: "Preferred Date",
            accessorKey: "preferred_date",
            fieldType: "date",
        },
        { id: "location_name", label: "Location", accessorKey: "location_name" },
        { id: "preferred_time_start", label: "Time Start", accessorKey: "preferred_time_start" },
        { id: "preferred_time_end", label: "Time End", accessorKey: "preferred_time_end" },
        { id: "is_flexible", label: "Flexible", accessorKey: "is_flexible" },
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
        {
            id: "location_notes",
            label: "Location Notes",
            accessorKey: "location_notes",
            fullWidth: true,
        },
    ],
    tabs: [],
};

export function ServiceRequestDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: sr, isLoading } = useServiceRequest(id);
    const rec = (sr ?? initialRecord) as Record<string, unknown> | null;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Service Request",
        listPath: "/service-requests",
        useUpdateHook: useUpdateServiceRequest,
        useDeleteHook: useDeleteServiceRequest,
    });

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        tabs: [
            {
                id: "assessment",
                label: "Assessment",
                content: rec ? (
                    <div className="density-gap-section">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Assessment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Requires Assessment
                                    </span>
                                    <Badge variant={rec.requires_assessment ? "info" : "ghost"}>
                                        {rec.requires_assessment ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                {typeof rec.assessment_date === "string" && rec.assessment_date && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Assessment Date
                                        </span>
                                        <span className="font-medium">
                                            {String(formatDate(rec.assessment_date, "compact"))}
                                        </span>
                                    </div>
                                )}
                                {Boolean(rec.assessed_by_name) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Assessed By</span>
                                        <span className="font-medium">
                                            {String(rec.assessed_by_name)}
                                        </span>
                                    </div>
                                )}
                                {typeof rec.assessment_notes === "string" &&
                                    rec.assessment_notes && (
                                        <div className="pt-2">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Notes
                                            </p>
                                            <p className="text-sm leading-relaxed">
                                                {rec.assessment_notes}
                                            </p>
                                        </div>
                                    )}
                                {!rec.requires_assessment && !rec.assessment_notes && (
                                    <p className="text-muted-foreground text-center py-6">
                                        No assessment required for this request.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        {typeof rec.internal_notes === "string" && rec.internal_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Internal Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {rec.internal_notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : null,
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Edit Request",
                    onClick: () => router.push(`/service-requests/${id}/edit`),
                },
                {
                    label: "Assign",
                    onClick: () => router.push(`/service-requests/${id}/edit?section=assignment`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
