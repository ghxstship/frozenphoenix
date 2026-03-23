import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ExpenseDetailClient } from "./_client";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("expenses", id);
    return <ExpenseDetailClient id={id} initialRecord={initialRecord} />;
}
