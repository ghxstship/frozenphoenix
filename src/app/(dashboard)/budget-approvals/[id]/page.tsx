import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BudgetApprovalsDetailClient } from "./_client";

export default async function BudgetApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("budget_approvals", id);
    return <BudgetApprovalsDetailClient id={id} initialRecord={initialRecord} />;
}
