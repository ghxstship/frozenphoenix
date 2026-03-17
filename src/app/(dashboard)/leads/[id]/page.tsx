"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteLead } from "@/lib/supabase";
import { useLead, useUpdateLead } from "@/lib/supabase";
import { useCreateRecordComment, useRecordActivityLog, useRecordComments } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { LEAD_BUDGET_LABELS } from "@/config/ui-variants";
import { formatRelativeTime } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    Calendar,
    DollarSign,
    Edit,
    Mail,
    Phone,
    TrendingUp,
    Users,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "leads",
    titleKey: "first_name",
    statusKey: "status",
    icon: Users,
    backHref: "/leads",
    backLabel: "Leads",
    chatter: false,
    fields: [
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone", icon: Phone },
        { id: "company", label: "Company", accessorKey: "company" },
        { id: "job_title", label: "Job Title", accessorKey: "job_title" },
        { id: "source", label: "Source", accessorKey: "source", fieldType: "status" },
        {
            id: "project_type",
            label: "Project Type",
            accessorKey: "project_type",
            fieldType: "status",
        },
    ],
    sidebarFields: [
        { id: "score", label: "Score", accessorKey: "score", fieldType: "number" },
        { id: "source", label: "Source", accessorKey: "source", fieldType: "status" },
        {
            id: "project_type",
            label: "Project Type",
            accessorKey: "project_type",
            fieldType: "status",
        },
        { id: "budget_range", label: "Budget", accessorKey: "budget_range" },
        {
            id: "created_at",
            label: "Created",
            accessorKey: "created_at",
            fieldType: "relative_time",
        },
        {
            id: "last_contacted_at",
            label: "Last Contact",
            accessorKey: "last_contacted_at",
            fieldType: "relative_time",
        },
    ],
    tabs: [],
};

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: leadId,
        entityLabel: "Lead",
        listPath: "/leads",
        useUpdateHook: useUpdateLead,
        useDeleteHook: useDeleteLead,
    });
    const { data: lead, isLoading } = useLead(leadId);
    const { data: sbActivity } = useRecordActivityLog("lead", leadId);
    const { data: sbComments } = useRecordComments("lead", leadId);
    const createComment = useCreateRecordComment();

    const activityItems: ActivityItem[] = useMemo(
        () =>
            (sbActivity ?? []).map((a) => ({
                id: a.id,
                action: a.action as ActivityItem["action"],
                actorName: a.user_profiles?.display_name ?? "System",
                entityType: a.entity_type,
                description: (a.metadata?.description as string) ?? undefined,
                createdAt: a.created_at,
            })),
        [sbActivity]
    );

    const chatterComments: CommentItem[] = useMemo(
        () =>
            (sbComments ?? []).map((c) => ({
                id: c.id,
                authorId: c.author_id,
                authorName: c.user_profiles?.display_name ?? "",
                content: c.body,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
            })),
        [sbComments]
    );

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "lead",
            entity_id: leadId,
            author_id: "u1",
            body: content,
        });
    };

    const fullName = lead ? `${lead.first_name} ${lead.last_name ?? ""}` : "";
    const initials = lead ? `${lead.first_name[0]}${(lead.last_name ?? " ")[0]}`.trim() : "";

    const sidebarSlot = lead ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${lead.email}`)}
                >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                </Button>
                {lead.phone && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(`tel:${lead.phone}`)}
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/deals/new?fromLead=${leadId}`)}
                >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Convert to Deal
                </Button>
            </CardContent>
        </Card>
    ) : undefined;

    const overviewSlot = lead ? (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                            {lead.email}
                        </a>
                    </div>
                    {lead.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>
                            {lead.company} · {lead.job_title}
                        </span>
                    </div>
                </CardContent>
            </Card>
            {lead.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {lead.notes}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        titleFn: () => fullName,
        subtitleFn: () => `${lead?.job_title ?? ""} at ${lead?.company ?? ""}`,
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Lead Score",
                icon: TrendingUp,
                compute: (r) => `${Number(r.score ?? 0)}/100`,
            },
            {
                label: "Budget",
                icon: DollarSign,
                compute: (r) =>
                    String((r.budget_range && LEAD_BUDGET_LABELS[r.budget_range as string]) ?? "—"),
            },
            { label: "Company", icon: Building2, compute: (r) => String(r.company ?? "—") },
            {
                label: "Created",
                icon: Calendar,
                compute: (r) => formatRelativeTime(String(r.created_at ?? "")),
            },
        ],
        tabs: [
            {
                id: "activity",
                label: "Activity",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activityItems.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-medium">
                                                    {item.actorName}
                                                </span>{" "}
                                                {item.description ?? item.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatRelativeTime(item.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                count: chatterComments.length,
                content: (
                    <RecordChatter
                        recordType="lead"
                        recordId={leadId}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const rec = lead as unknown as Record<string, unknown> | null;
    const record = rec ? { ...rec } : null;

    return (
        <DetailPageShell
            config={config}
            id={leadId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Convert to Deal",
                    onClick: () => router.push(`/deals/new?fromLead=${leadId}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {initials}
                </div>
            }
            actions={
                <>
                    <Button onClick={() => router.push(`/leads/${leadId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                </>
            }
        />
    );
}
