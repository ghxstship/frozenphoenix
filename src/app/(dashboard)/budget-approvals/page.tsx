"use client";

import { ListPageShell } from "@/components/shells";
import { useBudgetApprovals } from "@/lib/supabase/hooks-pages";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "budget_approvals",
    title: "Budget Approvals",
    description: "Multi-tier budget approval workflow with delegation and threshold-based routing",
    icon: CheckCircle2,
    searchKeys: ["name"],
    columns: [
        { id: "entity", header: "Entity", accessorKey: "entity" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "threshold_rule", header: "Threshold Rule", accessorKey: "threshold_rule" },
        { id: "level", header: "Level", accessorKey: "level" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "requested", header: "Requested", accessorKey: "requested" },
        { id: "approved", header: "Approved", accessorKey: "approved" },
        { id: "actions", header: "Actions", accessorKey: "actions" },
    ],
};

export default function BudgetApprovalsPage() {
    const { data: rawData, isLoading } = useBudgetApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
