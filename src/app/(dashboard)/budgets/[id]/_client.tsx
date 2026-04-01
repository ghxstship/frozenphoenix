"use client";

import { useRouter } from "next/navigation";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_BUDGET_LINE_ITEM_CONFIG } from "@/config/create-entity-configs";
import {
    useBudget,
    useBudgetLines,
    useDeleteBudget,
    useProjects,
    useUpdateBudget,
} from "@/lib/supabase";
import { useBudgetApprovals, useProductionBudgetLines } from "@/lib/supabase/hooks-finance";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records/entity-link";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BUDGET_CATEGORY_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    ClipboardList,
    DollarSign,
    Edit,
    FileText,
    Loader2,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

function ProductionBudgetLinesTab() {
    const { data: lines, isLoading } = useProductionBudgetLines();
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!lines || lines.length === 0)
        return (
            <EmptyState
                icon={ClipboardList}
                title="No production budget lines"
                description="Production-specific budget lines will appear here."
            />
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Production Budget Lines ({lines.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {lines.map((line) => (
                        <div
                            key={line.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(
                                        (line as unknown as Record<string, unknown>).description ??
                                            line.id
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {String(
                                        (line as unknown as Record<string, unknown>).category ?? ""
                                    )}
                                </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {formatCurrency(
                                    Number(
                                        (line as unknown as Record<string, unknown>)
                                            .estimated_amount ?? 0
                                    )
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function BudgetApprovalsTab({ budgetId }: { budgetId: string }) {
    const { data: approvals, isLoading } = useBudgetApprovals({ budget_id: budgetId });
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!approvals || approvals.length === 0)
        return (
            <EmptyState
                icon={ShieldCheck}
                title="No approval records"
                description="Budget approval records will appear here."
            />
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Budget Approvals ({approvals.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {approvals.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {String(
                                        (a as unknown as Record<string, unknown>).approver_name ??
                                            "Approver"
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {a.created_at ? formatDate(a.created_at) : ""}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    String(a.status) === "approved"
                                        ? "success"
                                        : String(a.status) === "rejected"
                                          ? "destructive"
                                          : "ghost"
                                }
                            >
                                {String(a.status ?? "pending")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "budget",
    statusKey: "status",
    icon: DollarSign,
    backHref: "/budgets",
    backLabel: "Budgets",
    chatterRecordType: "budget",
    fields: [
        {
            id: "effective_date",
            label: "Effective Date",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        { id: "currency", label: "Currency", accessorKey: "currency" },
        {
            id: "contingency_percent",
            label: "Contingency",
            accessorKey: "contingency_percent",
            fieldType: "percentage",
        },
        {
            id: "markup_percent",
            label: "Markup",
            accessorKey: "markup_percent",
            fieldType: "percentage",
        },
    ],
    sidebarFields: [
        { id: "version", label: "Version", accessorKey: "version", fieldType: "status" },
        {
            id: "effective_date",
            label: "Effective Date",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        {
            id: "contingency_percent",
            label: "Contingency",
            accessorKey: "contingency_percent",
            fieldType: "percentage",
        },
        {
            id: "markup_percent",
            label: "Markup",
            accessorKey: "markup_percent",
            fieldType: "percentage",
        },
        { id: "currency", label: "Currency", accessorKey: "currency" },
    ],
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

export function BudgetDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Budget",
        listPath: "/budgets",
        useUpdateHook: useUpdateBudget,
        useDeleteHook: useDeleteBudget,
    });
    const { data: budget, isLoading } = useBudget(id);
    const { data: sbLines } = useBudgetLines({ budget_id: id });
    const { data: sbProjects } = useProjects();

    const rec = budget ?? initialRecord;
    const lineItems: BudgetLineView[] = (sbLines ?? []).map((li: Record<string, unknown>) => ({
        id: li.id as string,
        category: (li.category ?? "") as string,
        description: (li.description ?? "") as string,
        budgetedAmount: Number(li.estimated_amount ?? li.unit_cost ?? 0),
        actualAmount: Number(li.actual_amount ?? 0),
        variance: Number(li.variance ?? 0),
    }));
    const project = rec
        ? (sbProjects ?? []).find(
              (p: Record<string, unknown>) => p.id === (rec as Record<string, unknown>).project_id
          )
        : null;
    const remaining = rec
        ? (((rec as Record<string, unknown>).total_budget as number) ?? 0) -
          (((rec as Record<string, unknown>).total_actual as number) ?? 0)
        : 0;
    const isOverBudget = remaining < 0;

    const sidebarSlot = project ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Related Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <EntityLink
                    entityType="project"
                    entityId={project.id}
                    entityName={project.name}
                    status={project.status}
                />
            </CardContent>
        </Card>
    ) : undefined;

    const overviewSlot = rec ? (
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
                            lineItems.reduce<Record<string, { budgeted: number; actual: number }>>(
                                (acc, li) => {
                                    const cat = li.category;
                                    if (!acc[cat]) acc[cat] = { budgeted: 0, actual: 0 };
                                    acc[cat].budgeted += li.budgetedAmount;
                                    acc[cat].actual += li.actualAmount;
                                    return acc;
                                },
                                {}
                            )
                        ).map(([cat, totals]) => {
                            const catConfig =
                                BUDGET_CATEGORY_CONFIG[cat as keyof typeof BUDGET_CATEGORY_CONFIG];
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
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        titleFn: () => (project ? `${project.name} Budget` : `Budget ${id}`),
        subtitleFn: () =>
            rec
                ? `Version ${String((rec as Record<string, unknown>).version)} · ${String((rec as Record<string, unknown>).currency ?? "USD")}`
                : "",
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Total Budget",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.total_budget ?? 0)),
            },
            {
                label: "Actual Spend",
                icon: TrendingUp,
                compute: (r) => formatCurrency(Number(r.total_actual ?? 0)),
            },
            {
                label: "Remaining",
                icon: isOverBudget ? TrendingDown : TrendingUp,
                compute: () => formatCurrency(remaining),
            },
        ],
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
                                        <Table className="w-full text-sm">
                                            <TableHeader>
                                                <TableRow className="border-b text-left">
                                                    <TableHead className="py-2 pr-4 font-medium text-muted-foreground">
                                                        Description
                                                    </TableHead>
                                                    <TableHead className="py-2 pr-4 font-medium text-muted-foreground">
                                                        Category
                                                    </TableHead>
                                                    <TableHead className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                        Budgeted
                                                    </TableHead>
                                                    <TableHead className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                        Actual
                                                    </TableHead>
                                                    <TableHead className="py-2 font-medium text-muted-foreground text-right">
                                                        Variance
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {lineItems.map((li) => (
                                                    <TableRow
                                                        key={li.id}
                                                        className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                                                    >
                                                        <TableCell className="py-3 pr-4 font-medium">
                                                            {li.description}
                                                        </TableCell>
                                                        <TableCell className="py-3 pr-4">
                                                            <Badge
                                                                variant="secondary"
                                                                className="capitalize"
                                                            >
                                                                {li.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-3 pr-4 text-right">
                                                            {formatCurrency(li.budgetedAmount)}
                                                        </TableCell>
                                                        <TableCell className="py-3 pr-4 text-right">
                                                            {formatCurrency(li.actualAmount)}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`py-3 text-right font-medium ${li.variance < 0 ? "text-success" : li.variance > 0 ? "text-destructive" : ""}`}
                                                        >
                                                            {formatCurrency(li.variance)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
                id: "production-lines",
                label: "Production Lines",
                content: <ProductionBudgetLinesTab />,
            },
            { id: "approvals", label: "Approvals", content: <BudgetApprovalsTab budgetId={id} /> },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={rec ? { ...(rec as Record<string, unknown>) } : null}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Export PDF", onClick: () => window.print() },
                {
                    label: "Create New Version",
                    onClick: () => router.push(`/budgets/new?duplicateFrom=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <DollarSign className="h-6 w-6" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/budgets/${id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
