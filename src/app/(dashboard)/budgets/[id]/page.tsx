import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { BudgetDetailClient } from "./_client";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("budget", id);
    return <BudgetDetailClient id={id} initialRecord={record} />;
}
