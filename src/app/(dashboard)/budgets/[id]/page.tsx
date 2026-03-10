"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_BUDGET_LINE_ITEM_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { useDeleteBudget, useUpdateBudget } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useBudget, useBudgetLines } from "@/lib/supabase/hooks-pages";
import { useProjects } from "@/lib/supabase/hooks";
import { BUDGET_CATEGORY_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    CheckCircle,
    DollarSign,
    Edit,
    FileText,
    Loader2,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

type TabId = "overview" | "line-items" | "approvals" | "chatter";
const TAB_VALUES = ["overview", "line-items", "approvals", "chatter"] as const;

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Sarah Chen",
        entityType: "budget",
        entityName: "this budget",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "approved",
        actorName: "Jordan Lee",
        entityType: "budget",
        description: "Budget approved",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
        id: "a3",
        action: "updated",
        actorName: "Sarah Chen",
        entityType: "budget",
        description: "Added catering line item",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
];

const PLACEHOLDER_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u2",
        authorName: "Jordan Lee",
        content: "Budget approved. Keep contingency at 10% — we may need it for AV overages.",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
];

export default function BudgetDetailPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const params = useParams();
    const router = useRouter();
    const budgetId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: budgetId,
        entityLabel: "Budget",
        listPath: "/budgets",
        useUpdateHook: useUpdateBudget,
        useDeleteHook: useDeleteBudget,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(PLACEHOLDER_COMMENTS);

    const { data: budget, isLoading } = useBudget(budgetId);
    const { data: sbLines } = useBudgetLines(budgetId);
    const { data: sbProjects } = useProjects();
    type BudgetLineView = {
        id: string;
        category: string;
        description: string;
        budgetedAmount: number;
        actualAmount: number;
        variance: number;
    };
    const lineItems: BudgetLineView[] = (sbLines ?? []).map((li: Record<string, unknown>) => ({
        id: li.id as string,
        category: (li.category ?? "") as string,
        description: (li.description ?? "") as string,
        budgetedAmount: Number(li.estimated_amount ?? li.unit_cost ?? 0),
        actualAmount: Number(li.actual_amount ?? 0),
        variance: Number(li.variance ?? 0),
    }));
    const project = budget
        ? (sbProjects ?? []).find(
              (p: Record<string, unknown>) =>
                  p.id === (budget as Record<string, unknown>).project_id
          )
        : null;

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    if (!budget) {
        return (
            <EmptyState
                icon={DollarSign}
                title="Budget not found"
                description="The budget you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Budgets", onClick: () => router.push("/budgets") }}
            />
        );
    }

    const utilization =
        budget.totalBudget > 0 ? Math.round((budget.totalActual / budget.totalBudget) * 100) : 0;
    const remaining = budget.totalBudget - budget.totalActual;
    const isOverBudget = remaining < 0;

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
        { id: "line-items" as const, label: "Line Items", count: lineItems.length },
        { id: "approvals" as const, label: "Approvals" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Budget Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <Badge variant="secondary">v{budget.version}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective Date</span>
                        <span>{formatDate(budget.effectiveDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Contingency</span>
                        <span>{budget.contingencyPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Markup</span>
                        <span>{budget.markupPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency</span>
                        <span>{budget.currency}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{utilization}%</span>
                    </div>
                    <ProgressBar
                        value={utilization}
                        size="sm"
                        variant={
                            isOverBudget ? "destructive" : utilization > 80 ? "warning" : "default"
                        }
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Related Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {project && (
                        <EntityLink
                            entityType="project"
                            entityId={project.id}
                            entityName={project.name}
                            status={project.status}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/budgets"
            backLabel="Budgets"
            entityType="budgets"
            entityId={budgetId}
            title={project ? `${project.name} Budget` : `Budget ${budgetId}`}
            subtitle={`Version ${budget.version} · ${budget.currency}`}
            status={budget.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <DollarSign className="h-6 w-6" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/budgets/${budgetId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
            menuItems={[
                { label: "Export PDF", onClick: () => window.print() },
                { label: "Create New Version", onClick: () => router.push(`/budgets/new?duplicateFrom=${budgetId}`) },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                            title="Total Budget"
                            value={formatCurrency(budget.totalBudget)}
                            icon={DollarSign}
                        />
                        <StatCard
                            title="Actual Spend"
                            value={formatCurrency(budget.totalActual)}
                            icon={TrendingUp}
                        />
                        <StatCard
                            title="Remaining"
                            value={formatCurrency(remaining)}
                            icon={isOverBudget ? TrendingDown : TrendingUp}
                        />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Spend by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lineItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No line items yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(
                                        lineItems.reduce<
                                            Record<string, { budgeted: number; actual: number }>
                                        >((acc, li) => {
                                            const cat = li.category;
                                            if (!acc[cat]) acc[cat] = { budgeted: 0, actual: 0 };
                                            acc[cat].budgeted += li.budgetedAmount;
                                            acc[cat].actual += li.actualAmount;
                                            return acc;
                                        }, {})
                                    ).map(([cat, totals]) => {
                                        const catConfig =
                                            BUDGET_CATEGORY_CONFIG[
                                                cat as keyof typeof BUDGET_CATEGORY_CONFIG
                                            ];
                                        const pct =
                                            totals.budgeted > 0
                                                ? Math.round(
                                                      (totals.actual / totals.budgeted) * 100
                                                  )
                                                : 0;
                                        return (
                                            <div key={cat} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium capitalize">
                                                        {catConfig?.label ?? cat}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {formatCurrency(totals.actual)} /{" "}
                                                        {formatCurrency(totals.budgeted)}
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    value={pct}
                                                    size="sm"
                                                    variant={
                                                        pct > 100
                                                            ? "destructive"
                                                            : pct > 80
                                                              ? "warning"
                                                              : "default"
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "line-items" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Line Items</CardTitle>
                        <Button size="sm" onClick={openCreate}>Add Line Item</Button>
                    </CardHeader>
                    <CardContent>
                        {lineItems.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No line items"
                                description="Add budget line items"
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="py-2 pr-4 font-medium text-muted-foreground">
                                                Description
                                            </th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground">
                                                Category
                                            </th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                Budgeted
                                            </th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                Actual
                                            </th>
                                            <th className="py-2 font-medium text-muted-foreground text-right">
                                                Variance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((li) => (
                                            <tr
                                                key={li.id}
                                                className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                                            >
                                                <td className="py-3 pr-4 font-medium">
                                                    {li.description}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize"
                                                    >
                                                        {li.category}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {formatCurrency(li.budgetedAmount)}
                                                </td>
                                                <td className="py-3 pr-4 text-right">
                                                    {formatCurrency(li.actualAmount)}
                                                </td>
                                                <td
                                                    className={`py-3 text-right font-medium ${li.variance < 0 ? "text-success" : li.variance > 0 ? "text-destructive" : ""}`}
                                                >
                                                    {formatCurrency(li.variance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "approvals" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Approval History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-success/10">
                                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Budget Approved</p>
                                    <p className="text-xs text-muted-foreground">
                                        Approved by Jordan Lee · {formatDate(budget.effectiveDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="budget"
                    recordId={budgetId}
                    activityItems={PLACEHOLDER_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
            <CreateEntityDialog config={CREATE_BUDGET_LINE_ITEM_CONFIG} open={createOpen} onClose={closeCreate} />
        </DetailLayout>
    );
}
