"use client";

import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { useDeleteLead, useUpdateLead } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { LEAD_BUDGET_LABELS } from "@/config/ui-variants";
import { formatRelativeTime } from "@/lib/utils";
import {
    Building2,
    Calendar,
    DollarSign,
    Edit,
    Mail,
    MessageSquare,
    Phone,
    TrendingUp,
    Users,
} from "lucide-react";

type TabId = "overview" | "activity" | "chatter";
const TAB_VALUES = ["overview", "activity", "chatter"] as const;

const DEMO_LEADS = [
    {
        id: "lead-1",
        first_name: "Sarah",
        last_name: "Mitchell",
        email: "sarah@techcorp.com",
        phone: "+1 (555) 123-4567",
        company: "TechCorp Global",
        job_title: "VP of Marketing",
        project_type: "brand_activation",
        budget_range: "500k_1m",
        status: "qualified",
        score: 85,
        source: "website",
        notes: "Interested in a multi-city brand activation tour. Budget approved internally. Wants to see case studies from similar projects.",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        last_contacted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
        id: "lead-2",
        first_name: "Marcus",
        last_name: "Chen",
        email: "mchen@festivalprod.com",
        phone: "+1 (555) 987-6543",
        company: "Festival Productions Inc",
        job_title: "Event Director",
        project_type: "festival_production",
        budget_range: "1m_5m",
        status: "new",
        score: 72,
        source: "referral",
        notes: "Referred by Derek Allen (Coachella). Looking for full production services for a new festival concept in Austin.",
        created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
        last_contacted_at: null,
    },
    {
        id: "lead-3",
        first_name: "Jennifer",
        last_name: "Walsh",
        email: "jwalsh@luxuryauto.com",
        phone: null,
        company: "Luxury Auto Group",
        job_title: "Brand Manager",
        project_type: "immersive_installation",
        budget_range: "150k_500k",
        status: "proposal_sent",
        score: 68,
        source: "trade_show",
        notes: "Met at SXSW. Looking for an immersive product launch experience for their new EV model.",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "System",
        entityType: "lead",
        entityName: "this lead",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "updated",
        actorName: "Alex Rivera",
        entityType: "lead",
        description: "Score updated to 85",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: "a3",
        action: "status_changed",
        actorName: "Alex Rivera",
        entityType: "lead",
        description: "Status changed to Qualified",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

const MOCK_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Alex Rivera",
        content:
            "Had a great discovery call. They have budget approved and are ready to move fast. Setting up proposal meeting for next week.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: leadId,
        entityLabel: "Lead",
        listPath: "/leads",
        useUpdateHook: useUpdateLead,
        useDeleteHook: useDeleteLead,
    });
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(MOCK_COMMENTS);

    const lead = DEMO_LEADS.find((l) => l.id === leadId);

    if (!lead) {
        return (
            <EmptyState
                icon={Users}
                title="Lead not found"
                description="The lead you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Leads", onClick: () => router.push("/leads") }}
            />
        );
    }

    const fullName = `${lead.first_name} ${lead.last_name}`;
    const initials = `${lead.first_name[0]}${lead.last_name[0]}`;

    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Alex Rivera",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "activity" as const, label: "Activity" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Score</span>
                        <Badge
                            variant={
                                lead.score >= 80
                                    ? "success"
                                    : lead.score >= 50
                                      ? "warning"
                                      : "secondary"
                            }
                        >
                            {lead.score}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Source</span>
                        <span className="capitalize">{lead.source.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Project Type</span>
                        <span className="capitalize">{lead.project_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                            {LEAD_BUDGET_LABELS[lead.budget_range] ?? lead.budget_range}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{formatRelativeTime(lead.created_at)}</span>
                    </div>
                    {lead.last_contacted_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Contact</span>
                            <span>{formatRelativeTime(lead.last_contacted_at)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                    </Button>
                    {lead.phone && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Convert to Deal
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/leads"
            backLabel="Leads"
            entityType="leads"
            entityId={leadId}
            title={fullName}
            subtitle={`${lead.job_title} at ${lead.company}`}
            status={lead.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {initials}
                </div>
            }
            actions={
                <>
                    <Button variant="outline" onClick={() => {}}>
                        <MessageSquare className="h-4 w-4" />
                        Log Activity
                    </Button>
                    <Button onClick={() => router.push(`/leads/${leadId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                </>
            }
            menuItems={[{ label: "Convert to Deal", onClick: () => {} }, ...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs">Lead Score</span>
                                </div>
                                <p className="text-xl font-bold">{lead.score}/100</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Budget Range</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {LEAD_BUDGET_LABELS[lead.budget_range] ?? "—"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-xs">Company</span>
                                </div>
                                <p className="text-xl font-bold truncate">{lead.company}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Created</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {formatRelativeTime(lead.created_at)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`mailto:${lead.email}`}
                                    className="text-primary hover:underline"
                                >
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
            )}

            {activeTab === "activity" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_ACTIVITY.map((item) => (
                                <div key={item.id} className="flex items-start gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm">
                                            <span className="font-medium">{item.actorName}</span>{" "}
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="lead"
                    recordId={leadId}
                    activityItems={MOCK_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
