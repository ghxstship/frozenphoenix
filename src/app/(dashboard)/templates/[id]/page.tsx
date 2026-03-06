"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteTemplate, useTemplate, useUpdateTemplate } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { formatDate } from "@/lib/utils";
import { Clock, Copy, Edit, FileText, LayoutTemplate, Star, Tag } from "lucide-react";

type TemplateCategory =
    | "proposal"
    | "contract"
    | "invoice"
    | "call_sheet"
    | "tech_sheet"
    | "sow"
    | "report"
    | "email";

interface TemplateItem {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
    lastUsed: string;
    usageCount: number;
    isDefault: boolean;
    tags: string[];
    createdBy: string;
    content?: string;
}

const CATEGORY_CONFIG: Record<
    TemplateCategory,
    { label: string; variant: "default" | "secondary" | "info" | "warning" | "success" }
> = {
    proposal: { label: "Proposal", variant: "info" },
    contract: { label: "Contract", variant: "default" },
    invoice: { label: "Invoice", variant: "success" },
    call_sheet: { label: "Call Sheet", variant: "warning" },
    tech_sheet: { label: "Tech Sheet", variant: "secondary" },
    sow: { label: "SOW", variant: "info" },
    report: { label: "Report", variant: "secondary" },
    email: { label: "Email", variant: "secondary" },
};

const mockTemplates: TemplateItem[] = [
    {
        id: "1",
        name: "Standard Client Proposal",
        category: "proposal",
        description:
            "Full-service experiential marketing proposal with scope, timeline, and budget sections",
        lastUsed: "2026-02-20",
        usageCount: 34,
        isDefault: true,
        tags: ["client", "full-service"],
        createdBy: "Sarah Chen",
        content:
            "# Client Proposal\n\n## Executive Summary\n[Project overview and key differentiators]\n\n## Scope of Work\n[Detailed deliverables and milestones]\n\n## Timeline\n[Phase breakdown with dates]\n\n## Investment\n[Budget breakdown with payment schedule]",
    },
    {
        id: "2",
        name: "Master Services Agreement",
        category: "contract",
        description: "Standard MSA template with all required legal clauses and signature blocks",
        lastUsed: "2026-02-15",
        usageCount: 18,
        isDefault: true,
        tags: ["legal", "msa"],
        createdBy: "Legal Team",
    },
    {
        id: "3",
        name: "Project Invoice — Time & Materials",
        category: "invoice",
        description:
            "Invoice template for T&M projects with detailed time entries and expense line items",
        lastUsed: "2026-02-22",
        usageCount: 52,
        isDefault: false,
        tags: ["billing", "t&m"],
        createdBy: "Finance Team",
    },
    {
        id: "4",
        name: "Event Call Sheet",
        category: "call_sheet",
        description:
            "Standard call sheet with crew schedule, venue details, catering, and emergency info",
        lastUsed: "2026-03-14",
        usageCount: 87,
        isDefault: true,
        tags: ["production", "crew"],
        createdBy: "Production Team",
    },
    {
        id: "5",
        name: "Venue Tech Rider",
        category: "tech_sheet",
        description:
            "Technical rider covering power, rigging, AV, network requirements and safety protocols",
        lastUsed: "2026-03-10",
        usageCount: 29,
        isDefault: true,
        tags: ["technical", "venue"],
        createdBy: "Technical Director",
    },
    {
        id: "6",
        name: "Statement of Work — Fixed Price",
        category: "sow",
        description:
            "Fixed-price SOW template with deliverables matrix, milestones, and acceptance criteria",
        lastUsed: "2026-01-30",
        usageCount: 12,
        isDefault: false,
        tags: ["legal", "fixed-price"],
        createdBy: "Legal Team",
    },
    {
        id: "7",
        name: "Post-Event Report",
        category: "report",
        description:
            "Comprehensive post-event report with KPIs, photos, budget reconciliation, and lessons learned",
        lastUsed: "2026-02-28",
        usageCount: 23,
        isDefault: true,
        tags: ["reporting", "post-event"],
        createdBy: "PM Team",
    },
    {
        id: "8",
        name: "Vendor NDA",
        category: "contract",
        description: "Non-disclosure agreement for vendors and subcontractors",
        lastUsed: "2026-02-05",
        usageCount: 41,
        isDefault: false,
        tags: ["legal", "nda", "vendor"],
        createdBy: "Legal Team",
    },
];

type TabId = "overview" | "preview" | "usage" | "chatter";
const TAB_VALUES = ["overview", "preview", "usage", "chatter"] as const;

const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Sarah Chen",
        entityType: "template",
        entityName: "this template",
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "updated",
        actorName: "Legal Team",
        entityType: "template",
        description: "Updated legal clauses",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
];

const MOCK_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Sarah Chen",
        content:
            "Updated the budget section to include the new contingency line. Please review before next proposal.",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
];

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;
    const { data: sbRecord } = useTemplate(templateId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: templateId,
        entityLabel: "Template",
        listPath: "/templates",
        useUpdateHook: useUpdateTemplate,
        useDeleteHook: useDeleteTemplate,
    });
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(MOCK_COMMENTS);

    const template = mockTemplates.find((t) => t.id === templateId);

    if (!template) {
        return (
            <EmptyState
                icon={LayoutTemplate}
                title="Template not found"
                description="The template you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Templates", onClick: () => router.push("/templates") }}
            />
        );
    }

    const catCfg = CATEGORY_CONFIG[template.category];

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

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "preview" as const, label: "Preview" },
        { id: "usage" as const, label: "Usage History" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant={catCfg.variant}>{catCfg.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Default</span>
                        <span>{template.isDefault ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created By</span>
                        <span>{template.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Used</span>
                        <span>{formatDate(template.lastUsed)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage Count</span>
                        <span className="font-medium">{template.usageCount}</span>
                    </div>
                </CardContent>
            </Card>
            {template.tags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {template.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <DetailLayout
            backHref="/templates"
            backLabel="Templates"
            title={template.name}
            subtitle={`${catCfg.label} Template · Used ${template.usageCount} times`}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <LayoutTemplate className="h-6 w-6" />
                </div>
            }
            actions={
                <>
                    <Button variant="outline" onClick={() => {}}>
                        <Copy className="h-4 w-4" />
                        Duplicate
                    </Button>
                    <Button onClick={() => router.push(`/templates/${templateId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                </>
            }
            menuItems={[
                {
                    label: template.isDefault ? "Remove Default" : "Set as Default",
                    onClick: () => {},
                },
                { label: "Export", onClick: () => {} },
                ...crudMenuItems,
            ]}
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
                                    <Copy className="h-4 w-4" />
                                    <span className="text-xs">Total Uses</span>
                                </div>
                                <p className="text-xl font-bold">{template.usageCount}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Last Used</span>
                                </div>
                                <p className="text-xl font-bold">{formatDate(template.lastUsed)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs">Category</span>
                                </div>
                                <p className="text-xl font-bold">{catCfg.label}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Star className="h-4 w-4" />
                                    <span className="text-xs">Default</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {template.isDefault ? "Yes" : "No"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "preview" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Template Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {template.content ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm bg-secondary/30 rounded-lg p-4">
                                {template.content}
                            </div>
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="No preview available"
                                description="Edit this template to add content"
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "usage" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Usage History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                {
                                    project: "Nike SXSW Activation",
                                    user: "Alex Rivera",
                                    date: "2026-02-20",
                                },
                                {
                                    project: "Coachella Main Stage 2026",
                                    user: "Sarah Chen",
                                    date: "2026-02-15",
                                },
                                {
                                    project: "Glossier Pop-Up NYC",
                                    user: "Jordan Park",
                                    date: "2026-02-10",
                                },
                            ].map((usage, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{usage.project}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Used by {usage.user}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(usage.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="template"
                    recordId={templateId}
                    activityItems={MOCK_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
