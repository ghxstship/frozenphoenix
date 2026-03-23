import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { PayrollBatchesDetailClient } from "./_client";

export default async function PayrollBatchesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("payroll_batches", id);
    return <PayrollBatchesDetailClient id={id} initialRecord={initialRecord} />;
}
