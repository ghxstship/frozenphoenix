import { FinancialPeriodsDetailClient } from "./_client";

export default async function FinancialPeriodsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <FinancialPeriodsDetailClient id={id} />;
}
