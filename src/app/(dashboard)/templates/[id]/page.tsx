"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeleteTemplate, useTemplate, useUpdateTemplate } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import type { DetailPageConfig } from "@/types/detail-page-config";
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

interface UsageItem {
    project: string;
    user: string;
    date: string;
}

function parseUsageHistory(raw: unknown): UsageItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((u) => ({
        project: (u.project as string) ?? (u.project_name as string) ?? "",
        user: (u.user as string) ?? (u.user_name as string) ?? "",
        date: (u.date as string) ?? (u.used_at as string) ?? "",
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "templates",
    titleKey: "name",
    subtitleFn: (r) => {
        const cat = ((r.category as string) ?? "proposal") as TemplateCategory;
        const catCfg = CATEGORY_CONFIG[cat];
        const count = (r.usage_count as number) ?? (r.usageCount as number) ?? 0;
        return `${catCfg.label} Template${count ? ` · Used ${count} times` : ""}`;
    },
    icon: LayoutTemplate,
    backHref: "/templates",
    backLabel: "Templates",
    chatterRecordType: "template",
    fields: [],
    tabs: [],
};

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;
    const { data: sbRecord, isLoading } = useTemplate(templateId);
    const tmpl = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: templateId,
        entityLabel: "Template",
        listPath: "/templates",
        useUpdateHook: useUpdateTemplate,
        useDeleteHook: useDeleteTemplate,
    });

    const tmplCategory = ((tmpl?.category as string) ?? "proposal") as TemplateCategory;
    const tmplDescription = (tmpl?.description as string) ?? "";
    const tmplLastUsed = (tmpl?.last_used as string) ?? (tmpl?.lastUsed as string) ?? "";
    const tmplUsageCount = (tmpl?.usage_count as number) ?? (tmpl?.usageCount as number) ?? 0;
    const tmplIsDefault = (tmpl?.is_default as boolean) ?? (tmpl?.isDefault as boolean) ?? false;
    const tmplTags = Array.isArray(tmpl?.tags) ? (tmpl.tags as string[]) : [];
    const tmplCreatedBy = (tmpl?.created_by as string) ?? (tmpl?.createdBy as string) ?? "";
    const tmplContent = (tmpl?.content as string) ?? "";
    const usageHistory = parseUsageHistory(tmpl?.usage_history ?? tmpl?.usageHistory);
    const catCfg = CATEGORY_CONFIG[tmplCategory];

    const sidebarSlot = (
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
                        <span>{tmplIsDefault ? "Yes" : "No"}</span>
                    </div>
                    {tmplCreatedBy && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created By</span>
                            <span>{tmplCreatedBy}</span>
                        </div>
                    )}
                    {tmplLastUsed && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Used</span>
                            <span>{formatDate(tmplLastUsed)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage Count</span>
                        <span className="font-medium">{tmplUsageCount}</span>
                    </div>
                </CardContent>
            </Card>
            {tmplTags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {tmplTags.map((tag) => (
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

    const overviewSlot = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Copy className="h-4 w-4" />
                            <span className="text-xs">Total Uses</span>
                        </div>
                        <p className="text-xl font-bold">{tmplUsageCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">Last Used</span>
                        </div>
                        <p className="text-xl font-bold">
                            {tmplLastUsed ? formatDate(tmplLastUsed) : "\u2014"}
                        </p>
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
                        <p className="text-xl font-bold">{tmplIsDefault ? "Yes" : "No"}</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {tmplDescription || "No description provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "preview",
                label: "Preview",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Template Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tmplContent ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm bg-secondary/30 rounded-lg p-4">
                                    {tmplContent}
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
                ),
            },
            {
                id: "usage",
                label: "Usage History",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Usage History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {usageHistory.length === 0 && (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        No usage history yet.
                                    </p>
                                )}
                                {usageHistory.map((usage, i) => (
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={templateId}
            record={tmpl}
            isLoading={isLoading}
            menuItems={[
                {
                    label: tmplIsDefault ? "Remove Default" : "Set as Default",
                    onClick: () => handleUpdate({ is_default: !tmplIsDefault }),
                },
                { label: "Export", onClick: () => window.print() },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <LayoutTemplate className="h-6 w-6" />
                </div>
            }
            actions={
                <>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/templates/new?duplicateFrom=${templateId}`)}
                    >
                        <Copy className="h-4 w-4" />
                        Duplicate
                    </Button>
                    <Button onClick={() => router.push(`/templates/${templateId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                </>
            }
        />
    );
}
