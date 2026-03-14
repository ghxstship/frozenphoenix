"use client";

import { useParams, useRouter } from "next/navigation";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_BUDGET_LINE_ITEM_CONFIG } from "@/config/create-entity-configs";
import {
    useBudget,
    useBudgetLines,
    useDeleteBudget,
    useUpdateBudget,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records/entity-link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProjects } from "@/lib/supabase/hooks";
import { BUDGET_CATEGORY_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { CheckCircle, DollarSign, Edit, FileText, TrendingDown, TrendingUp } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "budgets",
    statusKey: "status",
    icon: DollarSign,
    backHref: "/budgets",
    backLabel: "Budgets",
    chatterRecordType: "budget",
    fields: [],
    tabs: [],
};

type BudgetLineView = {
    id: string;
    category: string;
    description: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
};

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
    const { data: budget, isLoading } = useBudget(budgetId);
    const { data: sbLines } = useBudgetLines(budgetId);
    const { data: sbProjects } = useProjects();

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

    const utilization =
        budget && budget.total_budget > 0
            ? Math.round((budget.total_actual / budget.total_budget) * 100)
            : 0;
    const remaining = budget ? budget.total_budget - budget.total_actual : 0;
    const isOverBudget = remaining < 0;

    const sidebarSlot = budget ? (
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
                        <span>{formatDate(budget.effective_date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Contingency</span>
                        <span>{budget.contingency_percent ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Markup</span>
                        <span>{budget.markup_percent ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency</span>
                        <span>{budget.currency ?? "USD"}</span>
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
    ) : undefined;

    const overviewSlot = budget ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Total Budget"
                    value={formatCurrency(budget.total_budget)}
                    icon={DollarSign}
                />
                <StatCard
                    title="Actual Spend"
                    value={formatCurrency(budget.total_actual)}
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
                                        ? Math.round((totals.actual / totals.budgeted) * 100)
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
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        titleFn: () => (project ? `${project.name} Budget` : `Budget ${budgetId}`),
        subtitleFn: () => (budget ? `Version ${budget.version} · ${budget.currency ?? "USD"}` : ""),
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "line-items",
                label: "Line Items",
                content: (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Line Items</CardTitle>
                                <Button size="sm" onClick={openCreate}>
                                    Add Line Item
                                </Button>
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
                        <CreateEntityDialog
                            config={CREATE_BUDGET_LINE_ITEM_CONFIG}
                            open={createOpen}
                            onClose={closeCreate}
                        />
                    </>
                ),
            },
            {
                id: "approvals",
                label: "Approvals",
                content: (
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
                                            Approved by Jordan Lee ·{" "}
                                            {budget ? formatDate(budget.effective_date) : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    const record = budget ? { ...(budget as Record<string, unknown>) } : null;

    return (
        <DetailPageShell
            config={config}
            id={budgetId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                { label: "Export PDF", onClick: () => window.print() },
                {
                    label: "Create New Version",
                    onClick: () => router.push(`/budgets/new?duplicateFrom=${budgetId}`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
