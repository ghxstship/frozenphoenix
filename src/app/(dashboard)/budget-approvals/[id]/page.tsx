import { BudgetApprovalsDetailClient } from "./_client";

export default async function BudgetApprovalsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <BudgetApprovalsDetailClient id={id} />;
}
