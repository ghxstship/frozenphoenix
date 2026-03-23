import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { FinancialPeriodsDetailClient } from "./_client";

export default async function FinancialPeriodsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("financial_periods", id);
    return <FinancialPeriodsDetailClient id={id} initialRecord={initialRecord} />;
}
