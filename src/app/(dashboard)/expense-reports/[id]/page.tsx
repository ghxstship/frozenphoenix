import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ExpenseReportsDetailClient } from "./_client";

export default async function ExpenseReportsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("expense_reports", id);
    return <ExpenseReportsDetailClient id={id} initialRecord={initialRecord} />;
}
