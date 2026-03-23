import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { BudgetDetailClient } from "./_client";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("budgets", id);
    return <BudgetDetailClient id={id} initialRecord={initialRecord} />;
}
