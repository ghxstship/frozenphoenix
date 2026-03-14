"use client";

import { ListPageShell } from "@/components/shells";
import { useBudgetApprovals } from "@/lib/supabase/hooks-pages";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "payment_approvals",
    title: "Payment Approvals",
    description:
        "Payment authorization workflow with threshold-based routing and 3-way match verification",
    icon: CheckCircle2,
    searchKeys: ["name"],
    columns: [
        { id: "payee", header: "Payee", accessorKey: "payee" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "verification", header: "Verification", accessorKey: "verification" },
        { id: "threshold", header: "Threshold", accessorKey: "threshold" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "requested", header: "Requested", accessorKey: "requested" },
        { id: "actions", header: "Actions", accessorKey: "actions" },
    ],
};

export default function PaymentApprovalsPage() {
    const { data: rawData, isLoading } = useBudgetApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
